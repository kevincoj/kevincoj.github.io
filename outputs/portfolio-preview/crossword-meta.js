function checkMetaAnswer(guess, acceptedAnswers) {
  const normalize = value => String(value).normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]/gu, '');
  const answers = (acceptedAnswers || []).map(normalize).filter(Boolean);
  if (!answers.length) return 'unavailable';
  const answer = normalize(guess);
  if (!answer) return 'empty';
  return answers.includes(answer) ? 'correct' : 'incorrect';
}
if (typeof module !== 'undefined') module.exports = {checkMetaAnswer};
