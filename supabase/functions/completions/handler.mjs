const idPattern = /^[a-z0-9][a-z0-9-]{0,79}$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function decodeCursor(value) {
  if (!value) return null;
  if (value.length > 200) throw Error('Invalid cursor.');
  const decoded = JSON.parse(atob(value));
  if (!decoded || !uuidPattern.test(decoded.id) || typeof decoded.at !== 'string' || !/^\d{4}-\d\d-\d\dT/.test(decoded.at) || !Number.isFinite(Date.parse(decoded.at))) throw Error('Invalid cursor.');
  return decoded;
}
async function boundedBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw Object.assign(Error('A JSON body is required.'), {status:400});
  let size=0; const chunks=[];
  try { while(true) { const {done,value}=await reader.read(); if(done)break; size+=value.byteLength;
    if(size>4096) { await reader.cancel(); throw Object.assign(Error('Request is too large.'),{status:413}); } chunks.push(value); }
  } finally { reader.releaseLock(); }
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  try {return JSON.parse(new TextDecoder().decode(bytes));} catch {throw Object.assign(Error('A valid JSON body is required.'),{status:400});}
}
export function createCompletionHandler({repository, hashToken, rateLimit, allowedOrigins}) {
  return async request => {
    const origin=request.headers.get('origin');
    const headers={'content-type':'application/json','cache-control':'no-store','vary':'Origin'};
    if(allowedOrigins.includes(origin)) Object.assign(headers,{'access-control-allow-origin':origin,'access-control-allow-methods':'GET, POST, PATCH, OPTIONS','access-control-allow-headers':'content-type'});
    const reply=(status,data)=>new Response(data===null?null:JSON.stringify(data),{status,headers});
    if(origin&&!allowedOrigins.includes(origin))return reply(403,{error:'Origin is not allowed.'});
    if(request.method==='OPTIONS')return reply(204,null);
    if(!['GET','POST','PATCH'].includes(request.method))return reply(405,{error:'Method is not supported.'});
    try {
      if(!await rateLimit('global',600)) {headers['retry-after']='60';return reply(429,{error:'Please try again in a minute.'});}
      const url=new URL(request.url);let body=null;
      if(request.method!=='GET') body=await boundedBody(request);
      const puzzleId=body?.puzzleId??url.searchParams.get('puzzleId');
      if(typeof puzzleId!=='string'||!idPattern.test(puzzleId))return reply(400,{error:'A valid puzzle ID is required.'});
      let cursor;
      try {cursor=decodeCursor(url.searchParams.get('cursor'));} catch {return reply(400,{error:'Invalid cursor.'});}
      const puzzle=await repository.puzzle(puzzleId);
      if(!puzzle)return reply(404,{error:'This puzzle is not published.'});
      let own;
      if(body!==null) {
        if(!uuidPattern.test(body.browserToken||''))return reply(400,{error:'A valid browser token is required.'});
        if(body.revision!==puzzle.revision)return reply(409,{error:'This puzzle was updated. Reload it before submitting.'});
        const hash=await hashToken(body.browserToken);
        if(!await rateLimit(`browser:${hash}`,20)){headers['retry-after']='60';return reply(429,{error:'Please try again in a minute.'});}
        if(request.method==='PATCH') {
          if(typeof body.name!=='string'||/[\u0000-\u001f\u007f-\u009f]/u.test(body.name))return reply(400,{error:'Use a display name without control characters.'});
          const name=body.name.trim().replace(/\s+/gu,' ');
          if([...name].length<1||[...name].length>40)return reply(400,{error:'Use a name between 1 and 40 characters.'});
          own=await repository.name(puzzleId,hash,name,body.revision);
          if(!own)return reply(404,{error:'Record this completion before adding a name.'});
        } else own=await repository.record(puzzleId,hash,body.revision);
      }
      const summary=await repository.summary(puzzleId,cursor);
      const result={count:Number(summary.count),solvers:summary.solvers.map(r=>({name:r.name,completedAt:r.completedAt})),nextCursor:summary.nextCursor||null};
      if(own)Object.assign(result,{recorded:true,name:own.name??null});
      return reply(200,result);
    } catch(error) {
      return reply(error.status||503,{error:error.status?error.message:'Completion tracking is temporarily unavailable. Please try again.'});
    }
  };
}
