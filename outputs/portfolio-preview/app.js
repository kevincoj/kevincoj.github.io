// Design prototype: sample animations illustrate panel behavior, not the real products.
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const demos=[];
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);
function line(ctx,x1,y1,x2,y2,color='#171715',width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function text(ctx,words,x,y,size=16,weight=400){ctx.fillStyle='#171715';ctx.font=`${weight} ${size}px DM, Arial`;ctx.fillText(words,x,y)}
function race(ctx,t){
 const phase=(t%11)/11, stage=Math.min(2,Math.floor(phase*3));
 text(ctx,'A classroom coding race',35,37,17,600);
 const code=['for step in range(3):','    move_forward()','    check_progress()'];
 ctx.fillStyle='#fff9e2';ctx.fillRect(35,59,235,140);
 text(ctx,'challenge.py',49,81,10,500);line(ctx,49,90,255,90,'#d3bd65',1);
 for(let i=0;i<3;i++){ctx.fillStyle='#73632f';ctx.font='12px monospace';const chars=Math.max(0,Math.floor((phase*3-i)*28));ctx.fillText(code[i].slice(0,chars),49,116+i*25)}
 const lanes=['A','B','C'];
 lanes.forEach((label,i)=>{const y=94+i*38;text(ctx,label,292,y+4,10,600);line(ctx,313,y,474,y,'#d1b84d',2);const p=ease(Math.min(1,phase*(1.5-i*.2)));ctx.fillStyle='#171715';ctx.fillRect(313,y-5,161*p,10)});
 for(let y=0;y<4;y++)for(let x=0;x<3;x++){ctx.fillStyle=(x+y)%2?'#fff9e2':'#171715';ctx.fillRect(479+x*6,73+y*6,6,6)}line(ctx,479,73,479,183,'#171715',2);
 const labels=['Write a solution','Run the challenge','See progress'];text(ctx,labels[stage],35,232,12,500);
 for(let i=0;i<3;i++){ctx.fillStyle=i===stage?'#171715':'#c9b04d';ctx.fillRect(416+i*22,226,14,3)}
}
function measure(ctx,x,y,w,notes,bg,joined=0,padLeft=0,padRight=0){const inset=9*(1-joined);ctx.fillStyle=bg;ctx.fillRect(x-padLeft,y,w+padLeft+padRight,78);for(let j=0;j<6;j++)line(ctx,x+inset,y+15+j*9,x+w-inset,y+15+j*9,'#171715',1);line(ctx,x+inset,y+15,x+inset,y+60,'#171715',1);line(ctx,x+w-inset,y+15,x+w-inset,y+60,'#171715',1);notes.forEach((v,i)=>{const nx=x+22+i*(w-40)/2,ny=y+18+(i%3)*9;ctx.fillStyle=bg;ctx.fillRect(nx-4,ny-9,12,12);text(ctx,String(v),nx-2,ny+1,12,500)})}
function tabs(ctx,t){const phase=(t%10)/10;const mix=ease((phase-.28)/.28);const joined=ease((phase-.59)/.13);text(ctx,'From fragments to continuous tablature.',35,38,17,600);const smallW=112,bigW=140;[[0,2,3],[3,1,0],[0,3,2]].forEach((notes,i)=>{const x=lerp(42+i*151,42+i*140,mix);const y=lerp(84+(i%2)*13,112,mix);measure(ctx,x,y,lerp(smallW,bigW,mix),notes,'#e7edff',joined,i===0?9*joined:0,i===2?9*joined:0)});const label=phase<.3?'Cropped screenshots':phase<.59?'Aligning by measure':phase<.72?'Joining staff lines':'One continuous result';text(ctx,label,35,232,12,500);for(let i=0;i<3;i++){ctx.fillStyle=i===Math.min(2,Math.floor(phase*3))?'#171715':'#7a90c9';ctx.fillRect(416+i*22,226,14,3)}}
document.querySelectorAll('.media').forEach(panel=>{const canvas=panel.querySelector('canvas');canvas.width=1040;canvas.height=600;const ctx=canvas.getContext('2d');const d={panel,canvas,ctx,t:reduceMotion?7:0,last:0,paused:reduceMotion,video:null,url:null};demos.push(d);const button=panel.querySelector('.pause');button.setAttribute('aria-pressed',d.paused);function frame(now){if(d.last&&!d.paused&&!d.video)d.t+=(now-d.last)/1000;d.last=now;ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,520,300);if(panel.dataset.demo==='race')race(ctx,d.t);else tabs(ctx,d.t);requestAnimationFrame(frame)}requestAnimationFrame(frame);button.addEventListener('click',()=>{d.paused=!d.paused;button.setAttribute('aria-pressed',d.paused);button.setAttribute('aria-label',`${d.paused?'Play':'Pause'} ${panel.dataset.demo==='race'?'TeachLA':'tablature'} preview`);if(d.video){if(d.paused)d.video.pause();else d.video.play()}})});
document.querySelectorAll('[data-video]').forEach(input=>input.addEventListener('change',()=>{const file=input.files[0];if(!file)return;const d=demos.find(x=>x.panel.dataset.demo===input.dataset.video);if(d.url)URL.revokeObjectURL(d.url);d.url=URL.createObjectURL(file);d.video=d.panel.querySelector('video');d.video.src=d.url;d.video.hidden=false;d.canvas.hidden=true;d.panel.querySelector('.sample-label').textContent='Your recording';d.paused=false;d.panel.querySelector('.pause').setAttribute('aria-pressed','false');d.video.play().catch(()=>{d.paused=true;d.panel.querySelector('.pause').setAttribute('aria-pressed','true')})}));
document.querySelector('#reset-media').addEventListener('click',()=>{demos.forEach(d=>{if(d.video){d.video.pause();d.video.removeAttribute('src');d.video.load();d.video.hidden=true}if(d.url)URL.revokeObjectURL(d.url);d.video=null;d.url=null;d.canvas.hidden=false;d.panel.querySelector('.sample-label').textContent='Sample animation';d.paused=reduceMotion;d.panel.querySelector('.pause').setAttribute('aria-pressed',d.paused)});document.querySelectorAll('[data-video]').forEach(i=>i.value='')});
document.querySelectorAll('.explore').forEach(button=>button.addEventListener('click',()=>{const details=document.getElementById(button.dataset.details);details.open=!details.open;button.setAttribute('aria-expanded',details.open);button.firstChild.textContent=details.open?'Less detail ':'Explore project '}));
const puzzleSection=document.querySelector('#puzzle-section');function openPuzzles(){puzzleSection.hidden=false;if(puzzleRecords.size)showPuzzleLibrary();document.querySelector('#crosswords').scrollIntoView({behavior:reduceMotion?'instant':'smooth'})}document.querySelector('.puzzle-open').addEventListener('click',openPuzzles);document.querySelector('nav a[href="#crosswords"]').addEventListener('click',openPuzzles);document.querySelector('nav a[href="#about"]').addEventListener('click',()=>document.querySelector('#about').hidden=false);
document.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',()=>{document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a===link))}));
const pattern=['00100','01010','00000','10001','00100'];const mark=document.querySelector('.crossword-mark');pattern.join('').split('').forEach(bit=>{const i=document.createElement('i');if(bit==='1')i.className='black';mark.append(i)});
// Across Lite's basic rectangular, single-letter puzzle format.
function parsePuz(buffer){const bytes=new Uint8Array(buffer),view=new DataView(buffer);if(bytes.length<52)throw Error('This file is too short to be a .puz puzzle.');const ascii=(a,b)=>String.fromCharCode(...bytes.slice(a,b));if(ascii(2,13)!=='ACROSS&DOWN')throw Error('This is not a recognized Across Lite .puz file.');const w=bytes[44],h=bytes[45],count=view.getUint16(46,true),n=w*h;if(!w||!h||w>50||h>50||bytes.length<52+n*2)throw Error('The puzzle dimensions or grid data are invalid.');const solution=ascii(52,52+n);let pos=52+2*n;const decoder=new TextDecoder('windows-1252');function string(){const start=pos;while(pos<bytes.length&&bytes[pos]!==0)pos++;if(pos>=bytes.length)throw Error('The puzzle text is incomplete.');const s=decoder.decode(bytes.slice(start,pos));pos++;return s}const title=string(),author=string();string();const clues=Array.from({length:count},string);const entries=[];let number=0,k=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const idx=y*w+x;if(solution[idx]==='.')continue;const across=(x===0||solution[idx-1]==='.')&&x+1<w&&solution[idx+1]!=='.';const down=(y===0||solution[idx-w]==='.')&&y+1<h&&solution[idx+w]!=='.';if(!across&&!down)continue;number++;for(const direction of ['across','down']){if(!(direction==='across'?across:down))continue;const cells=[];let cx=x,cy=y;while(cx<w&&cy<h&&solution[cy*w+cx]!=='.'){cells.push(cy*w+cx);if(direction==='across')cx++;else cy++}entries.push({number,direction,clue:clues[k++]??'',cells})}}if(k!==count)throw Error('The clue count does not match this puzzle’s grid.');return{w,h,solution,title,author,entries,answersAvailable:view.getUint16(50,true)===0&&/^[a-z0-9.]+$/i.test(solution)}}
const crosswordPreferences = {...DEFAULT_CROSSWORD_SETTINGS};
let activeDirection = 'across';
let crosswordResizeObserver;
let crosswordCleanup;
// A tab-local collection; a future published puzzle catalog can use the same records.
const puzzleRecords = new Map();
function puzzleRecord(puzzle) {
  const key = JSON.stringify([puzzle.w, puzzle.h, puzzle.title, puzzle.author, puzzle.solution, puzzle.answersAvailable, puzzle.entries.map(entry => entry.clue)]);
  if (!puzzleRecords.has(key)) puzzleRecords.set(key, {puzzle, game:null, selectedIndex:null, direction:'across'});
  return puzzleRecords.get(key);
}
function renderPuzzleLibrary() {
  const list = document.querySelector('#crossword-list');
  list.replaceChildren();
  for (const record of puzzleRecords.values()) {
    const item = document.createElement('li');
    const copy = document.createElement('div');
    const title = document.createElement('h4');
    title.textContent = record.puzzle.title || 'Untitled crossword';
    const author = document.createElement('p');
    author.textContent = record.puzzle.author || '';
    copy.append(title, author);
    const phase = record.game?.phase || 'ready';
    const state = document.createElement('span');
    state.className = 'library-state';
    state.textContent = phase === 'completed' ? (record.game.revealed.size ? 'Completed with reveals' : 'Completed') : phase === 'ready' ? 'Not started' : 'In progress';
    if (record.puzzle.details?.meta?.answers?.length) {
      if (record.metaSolved) state.textContent += ' · Meta solved';
      else if (phase === 'completed') state.textContent += ' · Meta remaining';
    }
    const button = document.createElement('button');
    button.className = 'library-open';
    button.textContent = phase === 'completed' ? 'View puzzle' : phase === 'ready' ? 'Play' : 'Continue';
    button.addEventListener('click', () => displayPuzzle(record.puzzle));
    item.append(copy, state, button);
    list.append(item);
  }
  document.querySelector('#library-note').textContent = puzzleRecords.size < 2
    ? 'No other puzzles here yet. Open another .puz above to add one to your collection.'
    : 'Your opened puzzles are kept in this tab until you refresh. Choose a puzzle, or open another .puz above.';
}
function showPuzzleLibrary() {
  crosswordCleanup?.();
  crosswordCleanup = null;
  crosswordResizeObserver?.disconnect();
  document.querySelector('#solver').hidden = true;
  const library = document.querySelector('#crossword-library');
  library.hidden = false;
  renderPuzzleLibrary();
  library.focus({preventScroll:true});
  library.scrollIntoView({behavior:reduceMotion ? 'instant' : 'smooth', block:'start'});
}

function displayPuzzle(p) {
  p.details = p.details || CROSSWORD_DETAILS.find(item => item.title === p.title && (!item.author || item.author === p.author)) || {};
  crosswordCleanup?.();
  crosswordResizeObserver?.disconnect();
  activeDirection = 'across';
  const grid = document.querySelector('#grid');
  const clueColumns = document.querySelector('.clue-columns');
  grid.replaceChildren();
  grid.style.gridTemplateColumns = `repeat(${p.w},1fr)`;
  grid.style.gridTemplateRows = `repeat(${p.h},minmax(0,1fr))`;
  grid.style.setProperty('--ratio', `${p.w}/${p.h}`);
  document.querySelector('#puzzle-title').textContent = p.title || 'Untitled crossword';
  document.querySelector('#puzzle-author').textContent = p.author;
  const numbers = new Map();
  const inputs = new Map();
  const cells = new Map();
  const clueButtons = new Map();
  const entriesAt = new Map();
  p.entries.forEach(entry => {
    numbers.set(entry.cells[0], entry.number);
    entry.cells.forEach(index => {
      if (!entriesAt.has(index)) entriesAt.set(index, {});
      entriesAt.get(index)[entry.direction] = entry;
    });
  });
  let activeEntry = null;
  let activeIndex = null;
  const record = puzzleRecord(p);
  const game = record.game || new CrosswordGame(p);
  record.game = game;
  const details = p.details;
  const meta = details.meta?.answers?.length ? details.meta : null;
  const infoButton = document.querySelector('#puzzle-info');
  const infoDialog = document.querySelector('#puzzle-info-dialog');
  const metaPanel = document.querySelector('#meta-panel');
  const metaInput = document.querySelector('#meta-answer');
  const metaFeedback = document.querySelector('#meta-feedback');
  metaPanel.hidden = !meta;
  infoButton.hidden = !details.instructions && !meta;
  document.querySelector('#meta-prompt').textContent = meta?.prompt || '';
  metaInput.value = record.metaGuess || '';
  metaInput.readOnly = !!record.metaSolved;
  metaInput.removeAttribute('aria-invalid');
  document.querySelector('#meta-form button').disabled = !!record.metaSolved;
  metaFeedback.textContent = record.metaSolved ? 'Meta solved! You found the final answer.' : '';
  const navigation = new CrosswordNavigation(p, game, crosswordPreferences);
  let completionAnnounced = game.phase === 'completed';
  document.querySelector('#crossword-library').hidden = true;
  const solver = document.querySelector('#solver');
  const layout = solver.querySelector('.solver-layout');
  const toolbar = document.querySelector('#solver-toolbar');
  const timerText = document.querySelector('#puzzle-time');
  const timerButton = document.querySelector('#timer-toggle');
  const timerAction = document.querySelector('#timer-action');
  const cover = document.querySelector('#solver-cover');
  const coverButton = document.querySelector('#cover-continue');
  const feedback = document.querySelector('#solver-feedback');
  const dialog = document.querySelector('#crossword-dialog');
  const primary = dialog.querySelector('.dialog-primary');
  const secondary = dialog.querySelector('.dialog-secondary');
  const settingsDialog = document.querySelector('#settings-dialog');
  const settingsForm = document.querySelector('#settings-form');
  const settingsButton = document.querySelector('#puzzle-settings');
  let resumeAfterSettings = false;
  const uiEvents = new AbortController();
  const on = (element, name, handler) => element.addEventListener(name, handler, {signal: uiEvents.signal});
  let resumeAfterInfo = false;
  on(metaInput, 'input', () => {record.metaGuess = metaInput.value;});
  on(infoButton, 'click', () => {
    closeMenus();
    resumeAfterInfo = game.phase === 'playing';
    game.pause();
    renderPhase();
    document.querySelector('#puzzle-info-instructions').textContent = details.instructions || 'Solve the crossword, then look for the final meta answer in the grid.';
    document.querySelector('#puzzle-info-meta').textContent = meta?.prompt || '';
    infoDialog.showModal();
  });
  function closeInfo() {
    infoDialog.close();
    if (resumeAfterInfo) game.start();
    resumeAfterInfo = false;
    renderPhase();
    infoButton.focus({preventScroll:true});
  }
  on(document.querySelector('#close-puzzle-info'), 'click', closeInfo);
  on(infoDialog, 'cancel', event => {event.preventDefault(); closeInfo();});
  on(document.querySelector('#meta-form'), 'submit', event => {
    event.preventDefault();
    if (!meta || record.metaSolved || !['playing', 'completed'].includes(game.phase)) return;
    record.metaGuess = metaInput.value;
    const result = checkMetaAnswer(metaInput.value, meta.answers);
    if (result === 'correct') {
      record.metaSolved = true;
      metaInput.readOnly = true;
      document.querySelector('#meta-form button').disabled = true;
      metaInput.removeAttribute('aria-invalid');
      metaFeedback.textContent = 'Meta solved! You found the final answer.';
    } else {
      metaInput.setAttribute('aria-invalid', String(result === 'incorrect'));
      metaFeedback.textContent = result === 'empty' ? 'Enter a meta answer first.' : 'That’s not the meta answer. Take another look at the grid and try again.';
    }
  });
  const formatTime = milliseconds => {
    const seconds = Math.floor(milliseconds / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };
  function renderTimer() { timerText.textContent = formatTime(game.elapsedMs()); }
  function closeMenus() { toolbar.querySelectorAll('details').forEach(menu => menu.open = false); }
  function focusSelection() { if (game.phase === 'playing' || game.phase === 'completed') inputs.get(activeIndex)?.focus({preventScroll: true}); }
  function renderPhase() {
    const playing = game.phase === 'playing';
    const reviewing = game.phase === 'completed';
    solver.dataset.phase = game.phase;
    layout.inert = !playing && !reviewing;
    layout.classList.toggle('is-paused', !playing && !reviewing);
    cover.hidden = playing || reviewing;
    cover.querySelector('p').textContent = game.phase === 'ready' ? 'A fresh puzzle awaits.' : 'Your puzzle is paused.';
    coverButton.textContent = game.phase === 'ready' ? 'Play' : 'Continue';
    timerAction.textContent = reviewing ? 'Completed' : playing ? 'Pause' : game.phase === 'ready' ? 'Start' : 'Resume';
    timerButton.setAttribute('aria-label', reviewing ? 'View completion summary' : playing ? 'Pause puzzle' : game.phase === 'ready' ? 'Start puzzle' : 'Resume puzzle');
    toolbar.querySelectorAll('details').forEach(menu => {
      const unavailable = !playing || (menu.dataset.needsAnswers !== undefined && !game.answersAvailable);
      menu.inert = unavailable;
      menu.setAttribute('aria-disabled', String(unavailable));
      menu.title = !game.answersAvailable && menu.dataset.needsAnswers !== undefined ? 'This file does not include unlocked answers.' : '';
    });
    renderTimer();
  }
  function renderCell(index) {
    const input = inputs.get(index);
    if (!input) return;
    input.value = game.values[index];
    input.readOnly = game.isLocked(index) || game.phase === 'completed';
    const cell = cells.get(index);
    cell.classList.toggle('is-incorrect', game.marks[index] === 'incorrect');
    cell.classList.toggle('is-correct', game.marks[index] === 'correct');
    cell.classList.toggle('was-revealed', game.revealed.has(index));
    if (game.marks[index] === 'incorrect') input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    const descriptions = [];
    if (game.revealed.has(index)) descriptions.push('Answer revealed, permanent');
    else if (game.isLocked(index)) descriptions.push('Verified answer, permanent');
    if (game.marks[index]) descriptions.push(game.marks[index] === 'correct' ? 'Checked correct' : 'Checked incorrect');
    if (descriptions.length) input.setAttribute('aria-description', descriptions.join('. '));
    else input.removeAttribute('aria-description');
  }
  function renderAnswers() {
    game.indices.forEach(renderCell);
    const autocheck = document.querySelector('#autocheck-toggle');
    autocheck.setAttribute('aria-checked', String(game.autoCheck));
    autocheck.querySelector('span').textContent = game.autoCheck ? 'On' : 'Off';
  }
  function presentCompletion() {
    if (game.phase !== 'completed' || completionAnnounced) return false;
    completionAnnounced = true;
    renderAnswers();
    renderPhase();
    feedback.textContent = 'Puzzle completed. The timer is stopped; you can review your answers.';
    showDialog('complete');
    return true;
  }
  function showDialog(kind) {
    closeMenus();
    dialog.dataset.kind = kind;
    const confirmingClear = kind === 'clear';
    const confirmingReveal = kind === 'reveal';
    const confirming = confirmingClear || confirmingReveal;
    const complete = kind === 'complete';
    const metaRemaining = !!meta && !record.metaSolved;
    const startInstructions = document.querySelector('#start-instructions');
    startInstructions.hidden = kind !== 'start' || !details.instructions;
    startInstructions.textContent = details.instructions || '';
    const revealedCount = game.revealed.size;
    dialog.querySelector('.dialog-title').textContent = confirmingClear ? 'Clear your entries?'
      : confirmingReveal ? 'Reveal the whole puzzle?'
      : complete ? (revealedCount === game.indices.length ? 'Puzzle revealed.' : 'Crossword completed!')
      : kind === 'start' ? 'A little wordplay.' : 'Your puzzle is paused.';
    dialog.querySelector('.dialog-message').textContent = confirmingClear
      ? 'Your editable letters will be erased. Revealed and checked-correct letters are permanent and will stay. Your timer will keep its time.'
      : confirmingReveal ? 'This fills every remaining square with its answer. Revealed answers are permanent, and the timer will stop.'
      : complete ? `Final time: ${formatTime(game.elapsedMs())}.${revealedCount ? ` ${revealedCount} ${revealedCount === 1 ? 'square was' : 'squares were'} revealed.` : ' Every answer is correct.'}`
      : kind === 'start' ? 'Ready to start solving? The timer begins when you press Play.' : `Take your time. We’ll hold your place at ${formatTime(game.elapsedMs())}.`;
    if (complete && metaRemaining) {
      dialog.querySelector('.dialog-title').textContent = 'Grid completed!';
      dialog.querySelector('.dialog-message').textContent += ' There’s one more discovery: the meta answer.';
    }
    dialog.querySelector('.dialog-puzzle').textContent = p.title || 'Untitled crossword';
    dialog.querySelector('.dialog-author').textContent = p.author || '';
    primary.textContent = confirmingClear ? 'Clear entries' : confirmingReveal ? 'Reveal puzzle' : complete ? (metaRemaining ? 'Solve the meta' : 'More crosswords') : kind === 'start' ? 'Play' : 'Continue';
    secondary.textContent = confirming ? 'Keep solving' : complete ? 'View puzzle' : 'Not now';
    primary.onclick = () => {
      if (complete) {
        dialog.close();
        if (metaRemaining) {
          metaPanel.scrollIntoView({behavior:'instant', block:'center'});
          metaInput.focus({preventScroll:true});
        } else showPuzzleLibrary();
        return;
      }
      if (confirmingClear) {
        game.clear(game.indices);
        renderAnswers();
        feedback.textContent = 'Editable entries cleared. Permanent answers and timer kept.';
      } else if (confirmingReveal) {
        game.reveal(game.indices);
        renderAnswers();
      } else {
        game.start();
        renderPhase();
      }
      dialog.close();
      if (!presentCompletion()) focusSelection();
    };
    secondary.onclick = () => {
      dialog.close();
      if (confirming || complete) focusSelection();
      else coverButton.focus({preventScroll:true});
    };
    if (!dialog.open) dialog.showModal();
    (confirming ? secondary : primary).focus({preventScroll:true});
  }
  function eraseAndBack(index) {
    if (game.phase !== 'playing') return;
    game.setLetter(index, '');
    renderCell(index);
    selectCell(index);
    selectCell(navigation.back(activeEntry, index), activeDirection, true);
  }
  function useTool(action, scope) {
    if (game.phase !== 'playing') return;
    closeMenus();
    if (action === 'autocheck') {
      game.toggleAutocheck();
      renderAnswers();
      feedback.textContent = game.autoCheck ? 'Autocheck is on. New letters are checked as you type.' : 'Autocheck is off.';
      if (!presentCompletion()) focusSelection();
      return;
    }
    if (action === 'clear' && scope === 'puzzle') { showDialog('clear'); return; }
    if (action === 'reveal' && scope === 'puzzle') { showDialog('reveal'); return; }
    const indices = scope === 'puzzle' ? game.indices : scope === 'word' ? activeEntry?.cells || [] : activeIndex === null ? [] : [activeIndex];
    if (action === 'clear') {
      game.clear(indices);
      feedback.textContent = 'Editable letters in this word cleared. Permanent answers kept.';
    } else if (action === 'reveal') {
      if (!game.reveal(indices)) return;
      feedback.textContent = `${scope === 'puzzle' ? 'Puzzle' : scope === 'word' ? 'Word' : 'Square'} revealed. Revealed squares have blue letters and a corner mark.`;
    } else if (action === 'check') {
      if (!game.check(indices)) return;
      const incorrect = indices.filter(i => game.marks[i] === 'incorrect').length;
      const correct = indices.filter(i => game.marks[i] === 'correct').length;
      feedback.textContent = correct + incorrect === 0 ? 'No letters to check in this selection yet.' : `${incorrect} incorrect, ${correct} correct. Empty squares are left unchecked.`;
    }
    renderAnswers();
    if (!presentCompletion()) focusSelection();
  }
  function populateSettings(values) {
    for (const [key, value] of Object.entries(values)) {
      const controls = settingsForm.elements.namedItem(key);
      if (typeof value === 'boolean') controls.checked = value;
      else controls.value = value;
    }
  }
  function closeSettings(save) {
    if (save) {
      for (const [key, value] of Object.entries(DEFAULT_CROSSWORD_SETTINGS)) {
        const controls = settingsForm.elements.namedItem(key);
        crosswordPreferences[key] = typeof value === 'boolean' ? controls.checked : controls.value;
      }
    }
    settingsDialog.close();
    if (resumeAfterSettings) game.start();
    resumeAfterSettings = false;
    renderPhase();
    settingsButton.focus({preventScroll:true});
  }
  on(settingsButton, 'click', () => {
    closeMenus();
    populateSettings(crosswordPreferences);
    resumeAfterSettings = game.phase === 'playing';
    game.pause();
    renderPhase();
    settingsDialog.showModal();
    settingsDialog.querySelector('.settings-close').focus({preventScroll:true});
  });
  on(settingsForm, 'submit', event => { event.preventDefault(); closeSettings(true); });
  on(settingsDialog.querySelector('.settings-close'), 'click', () => closeSettings(false));
  on(document.querySelector('#restore-settings'), 'click', () => populateSettings(DEFAULT_CROSSWORD_SETTINGS));
  on(settingsDialog, 'cancel', event => { event.preventDefault(); closeSettings(false); });
  on(document.querySelector('#show-library'), 'click', showPuzzleLibrary);
  for (const [id, offset] of [['previous-clue', -1], ['next-clue', 1]]) {
    on(document.querySelector(`#${id}`), 'click', () => {
      if (!activeEntry || !['playing', 'completed'].includes(game.phase)) return;
      const entry = navigation.adjacent(activeEntry, offset);
      selectCell(entry.cells[0], entry.direction, true, true);
    });
  }
  on(timerButton, 'click', () => {
    if (game.phase === 'playing') { game.pause(); renderPhase(); showDialog('pause'); }
    else showDialog(game.phase === 'completed' ? 'complete' : game.phase === 'ready' ? 'start' : 'pause');
  });
  on(coverButton, 'click', () => showDialog(game.phase === 'ready' ? 'start' : 'pause'));
  on(dialog, 'cancel', event => { event.preventDefault(); secondary.click(); });
  on(toolbar, 'click', event => {
    const button = event.target.closest('[data-action]');
    if (button) useTool(button.dataset.action, button.dataset.scope);
    const summary = event.target.closest('summary');
    if (summary) toolbar.querySelectorAll('details').forEach(menu => { if (menu !== summary.parentElement) menu.open = false; });
  });
  on(document, 'click', event => { if (!toolbar.contains(event.target)) closeMenus(); });
  on(document, 'keydown', event => {
    if (event.key === 'Escape' && !dialog.open) {
      const openMenu = toolbar.querySelector('details[open]');
      if (openMenu) { event.preventDefault(); closeMenus(); openMenu.querySelector('summary').focus(); }
    }
  });
  const timerInterval = setInterval(renderTimer, 250);
  crosswordCleanup = () => {
    game.pause();
    record.selectedIndex = activeIndex;
    record.direction = activeDirection;
    clearInterval(timerInterval);
    uiEvents.abort();
    primary.onclick = secondary.onclick = null;
    if (dialog.open) dialog.close();
    if (settingsDialog.open) settingsDialog.close();
    if (infoDialog.open) infoDialog.close();
  };


  function centerClue(entry) {
    const button = clueButtons.get(entry);
    if (!button) return;
    const list = button.closest('ol');
    const buttonBox = button.getBoundingClientRect();
    const listBox = list.getBoundingClientRect();
    const top = list.scrollTop + buttonBox.top - listBox.top
      + buttonBox.height / 2 - list.clientHeight / 2;
    list.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  }

  function selectCell(index, direction = activeDirection, focus = false, recenter = false) {
    const available = entriesAt.get(index);
    if (!available) return;
    const entry = available[direction] || available.across || available.down;
    const changedEntry = activeEntry !== entry;
    if (activeIndex !== null) cells.get(activeIndex)?.classList.remove('active-cell');
    if (changedEntry) {
      document.querySelector('#current-clue-label').textContent = `${entry.number} ${entry.direction === 'across' ? 'Across' : 'Down'}:`;
      document.querySelector('#current-clue-text').textContent = entry.clue;
      activeEntry?.cells.forEach(i => cells.get(i)?.classList.remove('word-active'));
      const previousClue = clueButtons.get(activeEntry);
      previousClue?.removeAttribute('aria-current');
      entry.cells.forEach(i => cells.get(i)?.classList.add('word-active'));
      clueButtons.get(entry)?.setAttribute('aria-current', 'true');
    }
    activeEntry = entry;
    activeIndex = index;
    activeDirection = entry.direction;
    grid.dataset.direction = activeDirection;
    cells.get(index).classList.add('active-cell');
    if (focus) inputs.get(index)?.focus({ preventScroll: true });
    if (changedEntry || recenter) centerClue(entry);
  }

  for (let i = 0; i < p.w * p.h; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.cellIndex = i;
    cells.set(i, cell);
    if (p.solution[i] === '.') {
      cell.classList.add('black');
    } else {
      if (numbers.has(i)) {
        const number = document.createElement('small');
        number.textContent = numbers.get(i);
        cell.append(number);
      }
      const input = document.createElement('input');
      input.maxLength = 1;
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.setAttribute('aria-label', `Row ${Math.floor(i / p.w) + 1}, column ${i % p.w + 1}`);
      inputs.set(i, input);
      input.addEventListener('focus', () => { selectCell(i); input.select(); });
      function writeCharacter(character) {
        if (!game.setLetter(i, character)) { renderCell(i); return; }
        renderCell(i);
        selectCell(i);
        if (presentCompletion()) return;
        selectCell(navigation.advance(activeEntry, i), activeDirection, true);
      }
      input.addEventListener('beforeinput', event => {
        if (event.cancelable && ['deleteContentBackward', 'deleteContentForward'].includes(event.inputType)) {
          event.preventDefault();
          eraseAndBack(i);
          return;
        }
        if (!event.isComposing && event.cancelable && event.inputType === 'insertText' && /^[a-z0-9]$/i.test(event.data || '')) {
          event.preventDefault();
          writeCharacter(event.data);
        }
      });
      input.addEventListener('input', event => {
        if (event.isComposing) return;
        if (event.inputType?.startsWith('delete')) { eraseAndBack(i); return; }
        const value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
        if (value) writeCharacter(value);
        else { game.setLetter(i, ''); renderCell(i); }
      });
      input.addEventListener('keydown', event => {
        if (game.phase !== 'playing' && game.phase !== 'completed') { event.preventDefault(); return; }
        if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing && /^[a-z0-9]$/i.test(event.key)) {
          event.preventDefault();
          writeCharacter(event.key);
          return;
        }
        if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey && !event.altKey && activeEntry) {
          event.preventDefault();
          const entries = p.entries.filter(entry => entry.direction === activeDirection);
          const position = entries.indexOf(activeEntry);
          const next = entries[(position + (event.shiftKey ? -1 : 1) + entries.length) % entries.length];
          selectCell(next.cells[0], activeDirection, true, true);
          return;
        }
        if (event.key === ' ' || event.code === 'Space') {
          event.preventDefault();
          if (crosswordPreferences.spacebar === 'clear' && game.phase === 'playing') {
            game.setLetter(i, '');
            renderCell(i);
            selectCell(navigation.advance(activeEntry, i), activeDirection, true);
          } else if (crosswordPreferences.spacebar === 'toggle') {
            selectCell(i, activeDirection === 'across' ? 'down' : 'across', false, true);
          }
          return;
        }
        const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: p.w, ArrowUp: -p.w };
        if (moves[event.key]) {
          event.preventDefault();
          const next = navigation.arrow(i, activeDirection, event.key);
          selectCell(next.index, next.direction, true);
          return;
        }
        if (event.key === 'Backspace' || event.key === 'Delete') {
          event.preventDefault();
          eraseAndBack(i);
        }
      });
      cell.append(input);
    }
    grid.append(cell);
  }

  for (const direction of ['across', 'down']) {
    const list = document.querySelector('#' + direction);
    list.replaceChildren();
    list.setAttribute('aria-label', `${direction === 'across' ? 'Across' : 'Down'} clues`);
    p.entries.filter(entry => entry.direction === direction).forEach(entry => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.textContent = `${entry.number}. ${entry.clue}`;
      button.dataset.clueNumber = entry.number;
      button.addEventListener('click', () => selectCell(entry.cells[0], direction, true, true));
      clueButtons.set(entry, button);
      item.append(button);
      list.append(item);
    });
    list.scrollTop = 0;
  }
  document.querySelector('#solver').hidden = false;
  function fitSolvingView() {
    const availableWidth = layout.clientWidth * (window.innerWidth > 800 ? .62 : 1);
    const headerHeight = grid.getBoundingClientRect().top - solver.getBoundingClientRect().top;
    const availableHeight = Math.max(80, window.innerHeight - headerHeight - 40);
    // Whole device-pixel squares prevent alternating antialiased rule widths.
    const density = window.devicePixelRatio || 1;
    const rule = Math.max(1, Math.round(density)) / density;
    const border = rule * 2;
    const quantum = Number.isInteger(density) ? 1 : 1 / density;
    const squareWidth = (availableWidth - border * 2 - (p.w - 1) * rule) / p.w;
    const squareHeight = (availableHeight - border * 2 - (p.h - 1) * rule) / p.h;
    const square = Math.max(1, Math.floor(Math.min(squareWidth, squareHeight) / quantum) * quantum);
    const boardWidth = square * p.w + (p.w - 1) * rule + border * 2;
    layout.style.setProperty('--board-width', `${boardWidth}px`);
    grid.style.setProperty('--grid-rule', `${rule}px`);
    grid.style.setProperty('--grid-border', `${border}px`);
    grid.style.width = `${boardWidth}px`;
    grid.style.height = `${square * p.h + (p.h - 1) * rule + border * 2}px`;
  }
  fitSolvingView();
  on(window, 'resize', fitSolvingView);
  function sizeClueLists() {
    // Use the rendered square, so dense puzzles and narrow screens scale together.
    const square = grid.querySelector('.cell')?.getBoundingClientRect();
    if (square) {
      const size = Math.min(square.width, square.height);
      grid.style.setProperty('--letter-size', `${size * .58}px`);
      grid.style.setProperty('--number-size', `${Math.min(14, Math.max(6, size * .24), size * .3)}px`);
      grid.style.setProperty('--letter-inset', `${size * .15}px`);
      grid.style.setProperty('--number-inset', `${Math.max(.5, size * .035)}px`);
    }
    const boardHeight = grid.getBoundingClientRect().height;
    clueColumns.style.setProperty('--clue-column-height', `${boardHeight}px`);
    clueColumns.style.setProperty('--clue-offset', `${grid.offsetTop - grid.closest('.crossword-board').offsetTop}px`);
    if (activeEntry) centerClue(activeEntry);
  }
  sizeClueLists();
  crosswordResizeObserver = new ResizeObserver(sizeClueLists);
  crosswordResizeObserver.observe(grid);
  if (p.entries.length) selectCell(record.selectedIndex ?? p.entries[0].cells[0], record.direction, false, true);
  renderPhase();
  renderAnswers();
  feedback.textContent = game.answersAvailable ? 'Blue letters: checked correct. Red slash: incorrect. Corner mark: revealed.' : 'This file has no unlocked answers. Reveal and Check are unavailable.';
  solver.scrollIntoView({behavior:'instant', block:'start'});
  if (game.phase !== 'completed') showDialog(game.phase === 'ready' ? 'start' : 'pause');
  else feedback.textContent = 'Completed puzzle. Timer stopped; answers are read-only.';
}
document.querySelector('#puz-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const p=parsePuz(await file.arrayBuffer());displayPuzzle(p);e.target.value='';document.querySelector('#puz-message').textContent='Arrow keys move · Space switches direction · Tab / Shift+Tab changes clues · typing replaces a letter. Rebus and special puzzle features are not supported yet.'}catch(error){document.querySelector('#puz-message').textContent=error.message}});
