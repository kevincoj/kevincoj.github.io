function createCrosswordStorage(storage) {
  return {
    readPublished(id, revision) {
      try { const saved = JSON.parse(storage?.getItem(`portfolio-published:${id}`) || 'null'); return saved?.revision === revision ? saved.snapshot : null; }
      catch { return null; }
    },
    writePublished(id, revision, snapshot) {
      try { if (!storage) return false; storage.setItem(`portfolio-published:${id}`, JSON.stringify({revision, snapshot})); return true; }
      catch { return false; }
    }
  };
}
if (typeof module !== 'undefined') module.exports = {createCrosswordStorage};
