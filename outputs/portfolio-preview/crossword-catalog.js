const CrosswordCatalog = (() => {
  function validateCatalog(rows) {
    if (!Array.isArray(rows)) throw Error('The puzzle catalog is invalid.');
    const ids = new Set();
    for (const p of rows) {
      if (!p || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(p.id) || ids.has(p.id) ||
          typeof p.revision !== 'string' || !/^[a-zA-Z0-9._-]{1,80}$/.test(p.revision) ||
          typeof p.title !== 'string' || !p.title.trim() || typeof p.author !== 'string' ||
          !/^puzzles\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.puz$/.test(p.file) ||
          p.file.includes('..') || !/^\d{4}-\d{2}-\d{2}$/.test(p.publishedAt) || !Number.isFinite(Date.parse(p.publishedAt))) {
        throw Error('A puzzle catalog entry is invalid or duplicated.');
      }
      ids.add(p.id);
    }
    return rows;
  }
  async function loadCatalog({fetchImpl = fetch, baseUrl = location.href} = {}) {
    const response = await fetchImpl(new URL('puzzle-catalog.json', baseUrl));
    if (!response.ok) throw Error('Could not load the puzzle collection. Please try again.');
    return validateCatalog(await response.json());
  }
  async function loadPublishedPuzzle(entry, fetchImpl = fetch) {
    const response = await fetchImpl(entry.file);
    if (!response.ok) throw Error('Could not load this puzzle. Please try again.');
    return response.arrayBuffer();
  }
  return {validateCatalog, loadCatalog, loadPublishedPuzzle};
})();
if (typeof module !== 'undefined') module.exports = CrosswordCatalog;
