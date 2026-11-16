const {test}=require('node:test');const assert=require('node:assert/strict');
const {CrosswordGame}=require('../../outputs/portfolio-preview/crossword-game.js');
const {CrosswordSession}=require('../../outputs/portfolio-preview/crossword-session.js');
const p={solution:'CAT.ARE'};
test('page navigation keeps letters, locks and elapsed time, resuming paused',()=>{const g=new CrosswordGame(p,()=>7000);g.start();g.setLetter(0,'C');g.check([0]);g.reveal([1]);g.setLetter(2,'X');g.elapsed=12000;const copy=CrosswordSession.restore(p,JSON.parse(JSON.stringify(CrosswordSession.snapshot(g))));assert.equal(copy.phase,'paused');assert.equal(copy.elapsedMs(),12000);assert.equal(copy.values[2],'X');assert.ok(copy.isLocked(0));assert.ok(copy.revealed.has(1));});
test('completed and unstarted games keep their phases across pages',()=>{const g=new CrosswordGame(p);assert.equal(CrosswordSession.restore(p,CrosswordSession.snapshot(g)).phase,'ready');g.start();g.reveal(g.indices);const copy=CrosswordSession.restore(p,CrosswordSession.snapshot(g));assert.equal(copy.phase,'completed');assert.equal(copy.revealed.size,g.indices.length)});
test('corrupt saved answer arrays are rejected',()=>assert.throws(()=>CrosswordSession.restore(p,{values:[],marks:[],revealed:[]})));
