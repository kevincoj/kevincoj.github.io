import assert from 'node:assert/strict';
const endpoint=process.argv[2]||'https://fnpdxjxdymnnjcukcjeq.supabase.co/functions/v1/completions';
const origin='http://127.0.0.1:63219';
const cases=[
 {name:'CORS preflight',path:'',method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'POST'},expected:204},
 {name:'Missing puzzle ID',path:'',method:'GET',headers:{Origin:origin},expected:400},
 {name:'Unknown puzzle (database lookup)',path:'?puzzleId=live-smoke-unpublished',method:'GET',headers:{Origin:origin},expected:404},
 {name:'Unpublished puzzle write rejected',path:'',method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({puzzleId:'live-smoke-unpublished',revision:'1',browserToken:crypto.randomUUID()}),expected:404},
 {name:'Malformed JSON rejected',path:'',method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{',expected:400},
 {name:'Disallowed origin rejected',path:'?puzzleId=live-smoke-unpublished',method:'GET',headers:{Origin:'https://not-allowed.invalid'},expected:403},
 {name:'Invalid cursor rejected',path:'?puzzleId=live-smoke-unpublished&cursor=invalid',method:'GET',headers:{Origin:origin},expected:400}
];
let failures=0;
for(const c of cases){
 try{const response=await fetch(endpoint+c.path,{method:c.method,headers:c.headers,body:c.body,signal:AbortSignal.timeout(20000)});const body=await response.text();assert.equal(response.status,c.expected,body);if(c.headers.Origin===origin)assert.equal(response.headers.get('access-control-allow-origin'),origin);assert.equal(body.includes('browser_hash'),false);console.log(`PASS ${c.name}: HTTP ${response.status}`);}
 catch(e){failures++;console.error(`FAIL ${c.name}: ${e.message}`);}
}
if(failures)process.exitCode=1;else console.log(`${cases.length}/${cases.length} live API checks passed. No puzzle registrations or completion records were created.`);
