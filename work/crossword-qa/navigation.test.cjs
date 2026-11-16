const {test}=require('node:test');
const assert=require('node:assert/strict');
const {CrosswordNavigation,DEFAULT_CROSSWORD_SETTINGS}=require('../../outputs/portfolio-preview/crossword-navigation.js');
function setup(overrides={}){
 const entries=[{direction:'across',cells:[0,1,2]},{direction:'across',cells:[3,4,5]},{direction:'down',cells:[0,3]},{direction:'down',cells:[1,4]},{direction:'down',cells:[2,5]}];
 const game={values:['','','','','','']};
 const settings={...DEFAULT_CROSSWORD_SETTINGS,...overrides};
 return {entries,game,nav:new CrosswordNavigation({w:3,entries},game,settings)};
}
test('requested defaults are explicit',()=>assert.deepEqual(DEFAULT_CROSSWORD_SETTINGS,{arrowDirection:'stay',spacebar:'toggle',backspacePrevious:false,skipFilled:true,firstBlank:true,nextClue:true}));
test('arrow changes direction in place by default; repeated arrow moves',()=>{const {nav}=setup();assert.deepEqual(nav.arrow(1,'across','ArrowDown'),{index:1,direction:'down'});assert.deepEqual(nav.arrow(1,'down','ArrowDown'),{index:4,direction:'down'})});
test('alternate arrow option moves immediately and never crosses a row edge',()=>{const {nav}=setup({arrowDirection:'move'});assert.deepEqual(nav.arrow(1,'across','ArrowDown'),{index:4,direction:'down'});assert.deepEqual(nav.arrow(2,'across','ArrowRight'),{index:2,direction:'across'})});
test('automatic advance skips filled squares but can be turned off',()=>{const {nav,game,entries}=setup();game.values[1]='A';assert.equal(nav.advance(entries[0],0),2);const other=setup({skipFilled:false});other.game.values[1]='A';assert.equal(other.nav.advance(other.entries[0],0),1)});
test('end of word prefers its first blank before the next clue',()=>{const {nav,game,entries}=setup();game.values[2]='T';assert.equal(nav.advance(entries[0],2),0);game.values[0]='C';game.values[1]='A';assert.equal(nav.advance(entries[0],2),3)});
test('each end-of-word setting works independently',()=>{let s=setup({firstBlank:false});assert.equal(s.nav.advance(s.entries[0],2),3);s=setup({nextClue:false});s.game.values.fill('X');assert.equal(s.nav.advance(s.entries[0],2),2);s=setup({firstBlank:false,nextClue:false});assert.equal(s.nav.advance(s.entries[0],2),2)});
test('next clue wraps within the active direction and selects first blank when skipping',()=>{const {nav,game,entries}=setup();game.values[0]='C';game.values[3]='A';game.values[4]='R';game.values[5]='E';assert.equal(nav.advance(entries[1],5),1);assert.equal(nav.adjacent(entries[4],1).direction,'down');assert.equal(nav.adjacent(entries[4],1),entries[2])});
test('backspace stays at word start by default, optionally goes to prior word end',()=>{let s=setup();assert.equal(s.nav.back(s.entries[1],3),3);assert.equal(s.nav.back(s.entries[1],4),3);s=setup({backspacePrevious:true});assert.equal(s.nav.back(s.entries[1],3),2);assert.equal(s.nav.back(s.entries[0],0),5)});
test('spacebar clear at a word end advances instead of landing on the square just cleared',()=>{const {nav,game,entries}=setup();game.values[0]='C';game.values[1]='A';assert.equal(nav.advance(entries[0],2),3)});
