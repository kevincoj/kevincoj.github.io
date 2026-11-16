const {test}=require('node:test');
const assert=require('node:assert/strict');
const {checkMetaAnswer}=require('../../outputs/portfolio-preview/crossword-meta.js');
test('meta answer matching ignores case, spacing and punctuation',()=>{assert.equal(checkMetaAnswer('  THE north-star! ',['The North Star']),'correct')});
test('all configured variants are accepted',()=>{assert.equal(checkMetaAnswer('polaris',['North Star','Polaris']),'correct')});
test('wrong answers and empty guesses stay distinct',()=>{assert.equal(checkMetaAnswer('South',['North Star']),'incorrect');assert.equal(checkMetaAnswer(' --- ',['North Star']),'empty')});
test('unconfigured meta answers cannot be checked',()=>{assert.equal(checkMetaAnswer('anything',[]),'unavailable')});
