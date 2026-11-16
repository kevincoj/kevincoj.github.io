const {test}=require('node:test');const assert=require('node:assert/strict');
const {createCrosswordStorage}=require('../../outputs/portfolio-preview/crossword-storage.js');
const {CrosswordSession}=require('../../outputs/portfolio-preview/crossword-session.js');
const memory=()=>{const map=new Map();return{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)}};
test('published saves survive a new store and isolate revisions and corrupt records',()=>{const backend=memory(),one=createCrosswordStorage(backend);assert.equal(one.writePublished('a','1',{values:['A']}),true);assert.deepEqual(createCrosswordStorage(backend).readPublished('a','1'),{values:['A']});assert.equal(one.readPublished('a','2'),null);backend.setItem('portfolio-published:b','broken');assert.equal(one.readPublished('b','1'),null);assert.deepEqual(one.readPublished('a','1'),{values:['A']})});
test('denied storage is recoverable',()=>{const store=createCrosswordStorage({getItem(){throw Error()},setItem(){throw Error()}});assert.equal(store.readPublished('a','1'),null);assert.equal(store.writePublished('a','1',{}),false)});
test('restored completion is verified against actual answers',()=>{const game=CrosswordSession.restore({solution:'CAT'},{values:['X','',''],marks:[null,null,null],phase:'completed',revealed:[]});assert.equal(game.phase,'paused')});
