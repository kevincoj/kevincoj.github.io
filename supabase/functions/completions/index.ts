import {createCompletionHandler} from './handler.mjs';
const url=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const tokenSecret=Deno.env.get('COMPLETION_TOKEN_SECRET')!;
const allowedOrigins=(Deno.env.get('ALLOWED_ORIGINS')||'').split(',').map(s=>s.trim()).filter(Boolean);
if(!url||!key||!tokenSecret||tokenSecret.length<32||!allowedOrigins.length)throw Error('Configure completion secrets and ALLOWED_ORIGINS.');
async function rest(path:string,body?:unknown) {
  const response=await fetch(`${url}/rest/v1/${path}`,{method:body===undefined?'GET':'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'content-type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
  if(!response.ok)throw Error('Database request failed');return response.json();
}
const repository={
  async puzzle(id:string){return (await rest(`crossword_puzzles?id=eq.${encodeURIComponent(id)}&published=eq.true&select=revision`))[0]||null;},
  async record(id:string,hash:string,revision:string){return rest('rpc/crossword_record',{p_puzzle_id:id,p_browser_hash:hash,p_revision:revision});},
  async name(id:string,hash:string,name:string,revision:string){return rest('rpc/crossword_name',{p_puzzle_id:id,p_browser_hash:hash,p_name:name,p_revision:revision});},
  async summary(id:string,cursor:{at:string,id:string}|null){const result=await rest('rpc/crossword_summary',{p_puzzle_id:id,p_cursor_at:cursor?.at||null,p_cursor_id:cursor?.id||null});return {...result,nextCursor:result.cursor?btoa(JSON.stringify(result.cursor)):null};}
};
const hmacKey=await crypto.subtle.importKey('raw',new TextEncoder().encode(tokenSecret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
Deno.serve(createCompletionHandler({repository,allowedOrigins,
  hashToken:async(token:string)=>Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',hmacKey,new TextEncoder().encode(token)))).map(x=>x.toString(16).padStart(2,'0')).join(''),
  rateLimit:async(bucket:string,limit:number)=>rest('rpc/crossword_limit',{p_bucket:bucket,p_limit:limit})
}));
