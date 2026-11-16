function isCompletionEligible(record) {
  return !!record?.publishedId && record.game?.phase === 'completed' && !record.game.usedFullReveal &&
    !(record.game.indices?.length && record.game.revealed?.size === record.game.indices.length) &&
    (!record.puzzle.details?.meta?.answers?.length || !!record.metaSolved);
}
if(typeof module!=='undefined')module.exports={isCompletionEligible};
