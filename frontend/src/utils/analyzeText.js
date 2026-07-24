/**
 * Simulated Analysis Engine
 * Produces realistic, text-dependent scores without a backend.
 * Analyzes linguistic patterns to estimate AI vs human authorship.
 */
export function analyzeText(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  // Avg words per sentence (AI tends to be consistent: ~18-22)
  const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);

  // Vocabulary richness: unique / total words
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/\W/g, '')));
  const lexicalDiversity = uniqueWords.size / Math.max(wordCount, 1);

  // Repetition score: how many words repeat >3 times
  const freq = {};
  words.forEach((w) => {
    const wl = w.toLowerCase().replace(/\W/g, '');
    freq[wl] = (freq[wl] || 0) + 1;
  });
  const repeatedWords = Object.values(freq).filter((c) => c > 3).length;
  const repetitionRatio = repeatedWords / Math.max(uniqueWords.size, 1);

  // AI probability signal: uniform sentence length + low lexical diversity + repetition
  let aiSignal = 0;
  if (avgWordsPerSentence > 16 && avgWordsPerSentence < 24) aiSignal += 0.25;
  if (lexicalDiversity < 0.55) aiSignal += 0.30;
  if (repetitionRatio > 0.05) aiSignal += 0.20;
  if (wordCount < 30) aiSignal += 0.10; // Short texts are less conclusive

  // Use a stable text-derived offset so rescanning the same text does not
  // produce a visibly different result.
  const stableHash = Array.from(text).reduce(
    (hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0,
    0
  );
  aiSignal = Math.min(aiSignal + (stableHash % 9) / 100, 0.80);

  const aiPct = Math.round(aiSignal * 100);
  const humanPct = Math.round((1 - aiSignal) * 0.88 * 100); // small gap for "humanized AI"
  const humanizedPct = 100 - aiPct - humanPct;
  const authenticity = humanPct;

  // Misinformation: random-ish but seeded by text length + content
  const misinfoKeywords = ['fake', 'false', 'hoax', 'conspiracy', 'rumor', 'unverified', 'claim'];
  const misinfoHits = misinfoKeywords.filter((kw) =>
    text.toLowerCase().includes(kw)
  ).length;
  const misinfoRisk = misinfoHits > 1 ? 'High' : misinfoHits === 1 ? 'Medium' : 'Low';

  return { aiPct, humanPct, humanizedPct, authenticity, misinfoRisk };
}

/**
 * Highlight words in the user's text based on AI detection results.
 * Returns segments with color classes for rendering.
 */
export function buildHighlightedSegments(text, aiPct) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.map((sentence, i) => {
    const hash = sentence.length + i;
    if (aiPct > 50 && hash % 4 === 0) return { text: sentence, color: 'decoration-red-400 bg-red-50 text-red-800' };
    if (hash % 3 === 0) return { text: sentence, color: 'decoration-[#1FA463]/40 bg-green-50 text-green-800' };
    if (hash % 5 === 0) return { text: sentence, color: 'decoration-amber-400 bg-amber-50 text-amber-800' };
    if (aiPct > 35 && hash % 7 === 0) return { text: sentence, color: 'decoration-orange-400 bg-orange-50/70 text-orange-800' };
    return { text: sentence, color: null };
  });
}
