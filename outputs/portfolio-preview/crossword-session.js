const CrosswordSession = {
  snapshot(game) {
    if (!game) return null;
    return {values:game.values, marks:game.marks, revealed:[...game.revealed], autoCheck:game.autoCheck,
      phase:game.phase, elapsed:game.elapsedMs()};
  },
  restore(puzzle, saved) {
    const Game = typeof module !== 'undefined' ? require('./crossword-game.js').CrosswordGame : CrosswordGame;
    const game = new Game(puzzle);
    if (!saved) return game;
    if (!Array.isArray(saved.values) || !Array.isArray(saved.marks) || saved.values.length !== game.solution.length || saved.marks.length !== game.solution.length) throw Error('Invalid saved puzzle');
    game.values = saved.values.map(value => /^[A-Z0-9]?$/.test(value) ? value : '');
    game.marks = saved.marks.map(mark => ['correct','incorrect'].includes(mark) ? mark : null);
    game.revealed = new Set((saved.revealed || []).filter(index => game.indices.includes(index)));
    game.autoCheck = !!saved.autoCheck;
    game.phase = saved.phase === 'completed' ? 'completed' : saved.phase === 'ready' ? 'ready' : 'paused';
    game.elapsed = Math.max(0, Number(saved.elapsed) || 0);
    return game;
  }
};
if (typeof module !== 'undefined') module.exports = {CrosswordSession};
