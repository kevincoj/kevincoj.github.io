const DEFAULT_CROSSWORD_SETTINGS = Object.freeze({
  arrowDirection: 'stay',
  spacebar: 'toggle',
  backspacePrevious: false,
  skipFilled: true,
  firstBlank: true,
  nextClue: true
});

// Navigation reads answer state, but never changes letters or their permanent marks.
class CrosswordNavigation {
  constructor(puzzle, game, settings) {
    this.puzzle = puzzle;
    this.game = game;
    this.settings = settings;
    this.white = new Set(puzzle.entries.flatMap(entry => entry.cells));
  }
  adjacent(entry, offset) {
    const entries = this.puzzle.entries.filter(candidate => candidate.direction === entry.direction);
    return entries[(entries.indexOf(entry) + offset + entries.length) % entries.length];
  }
  entryStart(entry) {
    return (this.settings.skipFilled ? entry.cells.find(index => !this.game.values[index]) : undefined) ?? entry.cells[0];
  }
  advance(entry, index) {
    if (!entry) return index;
    const remaining = entry.cells.slice(entry.cells.indexOf(index) + 1);
    const next = remaining.find(candidate => !this.settings.skipFilled || !this.game.values[candidate]);
    if (next !== undefined) return next;
    if (this.settings.firstBlank) {
      const blank = entry.cells.find(candidate => candidate !== index && !this.game.values[candidate]);
      if (blank !== undefined) return blank;
    }
    return this.settings.nextClue ? this.entryStart(this.adjacent(entry, 1)) : index;
  }
  back(entry, index) {
    if (!entry) return index;
    const position = entry.cells.indexOf(index);
    if (position > 0) return entry.cells[position - 1];
    return this.settings.backspacePrevious ? this.adjacent(entry, -1).cells.at(-1) : index;
  }
  arrow(index, direction, key) {
    const nextDirection = key === 'ArrowDown' || key === 'ArrowUp' ? 'down' : 'across';
    if (nextDirection !== direction && this.settings.arrowDirection === 'stay') return {index, direction: nextDirection};
    const step = {ArrowRight: 1, ArrowLeft: -1, ArrowDown: this.puzzle.w, ArrowUp: -this.puzzle.w}[key];
    const next = index + step;
    const sameRow = Math.floor(next / this.puzzle.w) === Math.floor(index / this.puzzle.w);
    return {index: this.white.has(next) && (nextDirection === 'down' || sameRow) ? next : index, direction: nextDirection};
  }
}
if (typeof module !== 'undefined') module.exports = {CrosswordNavigation, DEFAULT_CROSSWORD_SETTINGS};
