// server/src/services/nlpService.js
import natural from "natural";
import stopword from "stopword";

// Простий keyword extractor — частотний, видаляємо стоп-слова
export function extractKeywords(text, topN = 12) {
  if (!text || typeof text !== "string") return [];

  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());

  const filtered = stopword.removeStopwords(tokens).filter(w => w.length > 2);

  const freq = {};
  filtered.forEach(w => {
    // можна додати нормалізацію (лемматизацію) пізніше
    freq[w] = (freq[w] || 0) + 1;
  });

  return Object.entries(freq)
    .sort((a,b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}
