class CrosswordGame {
  constructor(puzzle, now = () => performance.now()) {
    this.solution = puzzle.solution.toUpperCase();
    this.answersAvailable = puzzle.answersAvailable !== false;
    this.indices = [...this.solution].flatMap((letter, index) => letter === '.' ? [] : [index]);
    this.values = Array(this.solution.length).fill('');
    this.marks = Array(this.solution.length).fill(null);
    this.revealed = new Set();
    this.autoCheck = false;
    this.phase = 'ready';
    this.now = now;
    this.elapsed = 0;
    this.startedAt = null;
  }
  elapsedMs() {
    return this.elapsed + (this.phase === 'playing' ? Math.max(0, this.now() - this.startedAt) : 0);
  }
  start() {
    if (this.phase === 'playing' || this.phase === 'completed') return;
    this.startedAt = this.now();
    this.phase = 'playing';
  }
  pause() {
    if (this.phase !== 'playing') return;
    this.elapsed = this.elapsedMs();
    this.startedAt = null;
    this.phase = 'paused';
  }
  isLocked(index) { return this.revealed.has(index) || this.marks[index] === 'correct'; }
  finishIfSolved() {
    if (this.phase !== 'playing' || !this.answersAvailable || !this.indices.length) return;
    if (this.indices.every(index => this.values[index] === this.solution[index])) {
      this.elapsed = this.elapsedMs();
      this.startedAt = null;
      this.phase = 'completed';
    }
  }
  setLetter(index, value) {
    if (this.phase !== 'playing' || !this.indices.includes(index) || this.isLocked(index) || !/^[A-Z0-9]?$/i.test(value)) return false;
    this.values[index] = value.toUpperCase();
    this.marks[index] = null;
    if (this.autoCheck) this.check([index]);
    this.finishIfSolved();
    return true;
  }
  clear(indices) {
    if (this.phase !== 'playing') return false;
    for (const index of indices) {
      if (!this.indices.includes(index) || this.isLocked(index)) continue;
      this.values[index] = '';
      this.marks[index] = null;
    }
    return true;
  }
  reveal(indices) {
    if (this.phase !== 'playing' || !this.answersAvailable) return false;
    for (const index of indices) {
      if (!this.indices.includes(index) || this.isLocked(index)) continue;
      this.values[index] = this.solution[index];
      this.marks[index] = null;
      this.revealed.add(index);
    }
    this.finishIfSolved();
    return true;
  }
  check(indices) {
    if (this.phase !== 'playing' || !this.answersAvailable) return false;
    for (const index of indices) {
      if (!this.indices.includes(index)) continue;
      this.marks[index] = !this.values[index] ? null
        : this.values[index] === this.solution[index] ? 'correct' : 'incorrect';
    }
    this.finishIfSolved();
    return true;
  }
  toggleAutocheck() {
    if (this.phase !== 'playing' || !this.answersAvailable) return;
    this.autoCheck = !this.autoCheck;
    if (this.autoCheck) this.check(this.indices);
  }
}
if (typeof module !== 'undefined') module.exports = { CrosswordGame };
