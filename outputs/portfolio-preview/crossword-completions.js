function createCompletionClient({baseUrl,fetchImpl=fetch,storage,randomUUID=()=>crypto.randomUUID()}) {
  const inflight=new Map();
  const tokenKey='portfolio-completion-browser-v1';
  function identity() {
    try {
      if(!storage)throw Error();
      let token=storage.getItem(tokenKey);
      if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token||'')) {
        token=randomUUID();storage.setItem(tokenKey,token);
      }
      if(storage.getItem(tokenKey)!==token)throw Error();
      return token;
    } catch {throw Error('Allow browser storage to record a completion. You can keep solving without it.');}
  }
  async function request(method,puzzleId,revision,name,cursor) {
    if(!baseUrl)throw Error('Completion tracking is not available yet.');
    const url=new URL(baseUrl,typeof location==='undefined'?undefined:location.href);
    const options={method,headers:{'content-type':'application/json'},signal:AbortSignal.timeout(10000)};
    if(method==='GET'){url.searchParams.set('puzzleId',puzzleId);if(cursor)url.searchParams.set('cursor',cursor);}
    else options.body=JSON.stringify({puzzleId,revision,browserToken:identity(),...(name===undefined?{}:{name})});
    const response=await fetchImpl(url,options);
    const result=await response.json();
    if(!response.ok)throw Error(result.error||'Could not save your completion. Please try again.');
    if(!Number.isSafeInteger(result.count)||result.count<0||!Array.isArray(result.solvers)||(method!=='GET'&&result.recorded!==true))throw Error('The completion service did not confirm this request. Please try again.');
    return result;
  }
  return {
    configured:!!baseUrl,
    getSummary:(id,cursor)=>request('GET',id,undefined,undefined,cursor),
    record(id,revision) {
      const key=`${id}:${revision}`;
      if(!inflight.has(key)) {
        const promise=request('POST',id,revision).finally(()=>inflight.delete(key));inflight.set(key,promise);
      }
      return inflight.get(key);
    },
    setName:(id,revision,name)=>request('PATCH',id,revision,name)
  };
}
if(typeof module!=='undefined')module.exports={createCompletionClient};
