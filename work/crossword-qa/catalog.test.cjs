const {test}=require('node:test'); const assert=require('node:assert/strict');
const {validateCatalog,loadCatalog}=require('../../outputs/portfolio-preview/crossword-catalog.js');
const valid={id:'first-puzzle',revision:'1',title:'First',author:'Kevin',file:'puzzles/first.puz',publishedAt:'2026-11-16'};
test('empty catalog is valid and loads',async()=>{assert.deepEqual(validateCatalog([]),[]);assert.deepEqual(await loadCatalog({fetchImpl:async()=>({ok:true,json:async()=>[]}),baseUrl:'http://local/'}),[])});
test('catalog rejects duplicate IDs, malformed metadata and escaping assets',()=>{for(const rows of [[valid,valid],[{...valid,id:'../x'}],[{...valid,revision:''}],[{...valid,file:'https://evil/x.puz'}],[{...valid,file:'../secret.puz'}],[{...valid,file:'puzzles/%2e%2e/x.puz'}],[{...valid,publishedAt:'yesterday'}]]) assert.throws(()=>validateCatalog(rows));assert.equal(validateCatalog([valid])[0].id,valid.id)});
test('catalog network failure is explicit',async()=>assert.rejects(loadCatalog({fetchImpl:async()=>({ok:false}),baseUrl:'http://local/'})));
