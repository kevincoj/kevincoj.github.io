const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const pageMode=document.body.dataset.page;
// Across Lite's basic rectangular, single-letter puzzle format.

const crosswordPreferences = {...DEFAULT_CROSSWORD_SETTINGS};
let activeDirection = 'across';
let crosswordResizeObserver;
let crosswordCleanup;
const puzzleRecords = new Map();
const sessionKey = 'portfolio-crosswords-v1';
const developmentMode = new URLSearchParams(location.search).get('dev') === '1';
let persistentStorage;
try { persistentStorage = localStorage; } catch {}
const publishedStorage = createCrosswordStorage(persistentStorage);
let saveTimer;
const completionClient=createCompletionClient({baseUrl:window.CROSSWORD_COMPLETIONS_URL||'',storage:persistentStorage});
function puzzleKey(p) {
  return p.publishedId ? `published:${p.publishedId}` : JSON.stringify([p.w,p.h,p.title,p.author,p.solution,p.answersAvailable,p.entries.map(e=>e.clue)]);
}
function saveCrosswordSession() {
  let publishedSaved = true;
  for (const record of puzzleRecords.values()) {
    if (!record.publishedId || !record.puzzle.solution) continue;
    const snapshot = {game:CrosswordSession.snapshot(record.game), selectedIndex:record.selectedIndex, direction:record.direction, metaGuess:record.metaGuess, metaSolved:record.metaSolved, preferences:crosswordPreferences};
    if (!publishedStorage.writePublished(record.publishedId,record.revision,snapshot)) publishedSaved=false;
  }
  if (!publishedSaved) document.querySelector('#puz-message').textContent = 'Your browser could not save progress. You can keep solving, but it may be lost when you leave.';
  try {
    sessionStorage.setItem(sessionKey, JSON.stringify({preferences:crosswordPreferences, records:[...puzzleRecords.values()].filter(r=>!r.publishedId).map(record=>({...record,game:CrosswordSession.snapshot(record.game)}))}));
    return true;
  } catch { return false; }
}
function queueCrosswordSave() { clearTimeout(saveTimer); saveTimer=setTimeout(saveCrosswordSession,150); }
try {
  const saved=JSON.parse(sessionStorage.getItem(sessionKey)||'null');
  if (developmentMode) for (const record of saved?.records||[]) {
    try { record.game=CrosswordSession.restore(record.puzzle,record.game); puzzleRecords.set(puzzleKey(record.puzzle),record); } catch {}
  }
  for (const [key,value] of Object.entries(saved?.preferences||{})) if (key in crosswordPreferences && typeof crosswordPreferences[key]===typeof value) crosswordPreferences[key]=value;
} catch {}
window.addEventListener('pagehide',()=>{crosswordCleanup?.();saveCrosswordSession();});
document.addEventListener('visibilitychange',()=>{if(document.hidden) saveCrosswordSession();});
document.addEventListener('input',queueCrosswordSave);
document.addEventListener('click',queueCrosswordSave);
document.addEventListener('keyup',queueCrosswordSave);
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
function puzzleRecord(puzzle) {
  const key=puzzleKey(puzzle);
  if (!puzzleRecords.has(key)) {
    const record={id:puzzle.publishedId||crypto.randomUUID(),publishedId:puzzle.publishedId,revision:puzzle.revision,puzzle,game:null,selectedIndex:null,direction:'across'};
    if (record.publishedId) {
      const saved=publishedStorage.readPublished(record.publishedId,record.revision);
      if(saved) try {
        record.game=CrosswordSession.restore(puzzle,saved.game);
        record.selectedIndex=saved.selectedIndex;record.direction=saved.direction;
        record.metaGuess=typeof saved.metaGuess==='string'?saved.metaGuess:'';
        record.metaSolved=!!saved.metaSolved && !!puzzle.details?.meta?.answers?.length && checkMetaAnswer(record.metaGuess,puzzle.details.meta.answers)==='correct';
        for(const [key,value] of Object.entries(saved.preferences||{})) if(key in crosswordPreferences && typeof crosswordPreferences[key]===typeof value)crosswordPreferences[key]=value;
      } catch {}
    }
    puzzleRecords.set(key,record);
  }
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
    if(record.publishedId) {
      const count=document.createElement('span');count.className='library-completion-count';count.textContent='Loading completions…';copy.append(count);
      completionClient.getSummary(record.publishedId).then(summary=>{count.textContent=`${summary.count} ${summary.count===1?'completion':'completions'}`;}).catch(()=>{count.textContent='Completion count unavailable';});
    }
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
    ? (developmentMode ? 'Development imports stay in this browser tab.' : 'New crosswords will appear here when Kevin publishes them.')
    : 'Choose a puzzle. Published puzzle progress is saved in this browser.';
}
function showPuzzleLibrary() {
  if (pageMode === 'puzzle') {
    crosswordCleanup?.();
    crosswordCleanup = null;
    saveCrosswordSession(); location.assign(`crosswords.html${developmentMode?'?dev=1':''}`);
    return;
  }
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

async function displayPuzzle(p) {
  if(p.publishedId && !p.solution) { saveCrosswordSession(); location.assign(`puzzle.html?id=${encodeURIComponent(p.publishedId)}`); return; }
  p.details = p.details || CROSSWORD_DETAILS.find(item => item.title === p.title && (!item.author || item.author === p.author)) || {};
  if (pageMode === 'collection') {
    const record = puzzleRecord(p);
    const saved=saveCrosswordSession();
    if(record.publishedId||saved) location.assign(`puzzle.html?id=${encodeURIComponent(record.id)}${developmentMode?'&dev=1':''}`);
    else document.querySelector('#puz-message').textContent='Development imports need session storage to open. Allow storage and try again.';
    return;
  }
  document.title = `${p.title || 'Crossword'} — Kevin Co`;
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
  let completionView;
  const details = p.details;
  const meta = details.meta?.answers?.length ? details.meta : null;
  const infoButton = document.querySelector('#puzzle-info');
  const infoDialog = document.querySelector('#puzzle-info-dialog');
  const metaPanel = document.querySelector('#meta-panel');
  const metaInput = document.querySelector('#meta-answer');
  const metaFeedback = document.querySelector('#meta-feedback');
  metaPanel.hidden = !meta;
  infoButton.hidden = false;
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
    document.querySelector('#puzzle-info-instructions').textContent = details.instructions || 'Use the arrow keys to move, Space to switch direction, and Tab to change clues. Blue letters are checked correct; a red slash marks an incorrect answer, and a corner mark means revealed. Verified and revealed answers are permanent.';
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
      completionView?.updateEligibility();
      queueCrosswordSave();
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
    completionView?.updateEligibility();
    queueCrosswordSave();
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
        game.reveal(game.indices,true);
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
    const shellWidth = solver.clientWidth;
    const clueWidth = Math.min(480, Math.max(360, shellWidth * .38));
    const availableWidth = window.innerWidth > 800 ? shellWidth - clueWidth - 28 : shellWidth;
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
    layout.style.width = window.innerWidth > 800 ? `${boardWidth + clueWidth + 28}px` : '100%';
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
  completionView=createCompletionView({record,client:completionClient,solver,dialog,openCompletion:()=>showDialog('complete')});
  const previousCleanup=crosswordCleanup;
  crosswordCleanup=()=>{completionView.destroy();previousCleanup?.();};
}
document.querySelector('#puz-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const p=parsePuz(await file.arrayBuffer());displayPuzzle(p);e.target.value='';document.querySelector('#puz-message').textContent='Arrow keys move · Space switches direction · Tab / Shift+Tab changes clues · typing replaces a letter. Rebus and special puzzle features are not supported yet.'}catch(error){document.querySelector('#puz-message').textContent=error.message}});

async function initializeCrosswords() {
  document.querySelector('#puz-file').closest('label').hidden=!developmentMode;
  document.querySelector('#puz-message').textContent='Loading crosswords…';
  try {
    const entries=await CrosswordCatalog.loadCatalog();
    const requestedId=new URLSearchParams(location.search).get('id');
    const relevant=pageMode==='collection'?entries:entries.filter(e=>e.id===requestedId);
    for(const entry of relevant) {
      if(pageMode==='collection') {
        const puzzle={publishedId:entry.id,revision:entry.revision,title:entry.title,author:entry.author,details:entry.details||{}};
        const record={id:entry.id,publishedId:entry.id,revision:entry.revision,puzzle,game:null,entry};
        puzzleRecords.set(puzzleKey(puzzle),record);
      } else {
        const p=parsePuz(await CrosswordCatalog.loadPublishedPuzzle(entry));
        Object.assign(p,{publishedId:entry.id,revision:entry.revision,details:entry.details||{}});
        puzzleRecord(p);
      }
    }
    if(pageMode==='collection') {
      // Fetch only the puzzle a visitor opens; the catalog stays lightweight.
      showPuzzleLibrary();
      document.querySelector('#puz-message').textContent=entries.length?'Pick a crossword to play.':'No crosswords published yet. Check back soon.';
    } else {
      const record=[...puzzleRecords.values()].find(r=>r.id===requestedId);
      if(record) displayPuzzle(record.puzzle);
      else document.querySelector('#puz-message').textContent='This puzzle is not available. Visit Crosswords to choose another.';
    }
  } catch(error) {
    document.querySelector('#puz-message').textContent=error.message;
    const retry=document.createElement('button');retry.textContent='Try again';retry.onclick=()=>{retry.remove();initializeCrosswords();};document.querySelector('#puz-message').append(' ',retry);
  }
}
initializeCrosswords();
