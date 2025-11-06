// server/src/services/keywordExtractor.js
import natural from "natural";
import sw from "stopword";

// (необов'язково) список українських стоп-слів (короткий приклад — доповни великим списком)
const ukrStopwords = [
  "і","в","не","на","та","що","з","до","у","по","за","як","то","це","для","при","від","із","до","або"
];

export function extractKeywords(text = "", topN = 20) {
  if (!text || typeof text !== "string") return [];

  // 1) нормалізація: нижній регістр
  const lower = text.toLowerCase();

  // 2) токенізація (word tokenizer)
  const tokenizer = new natural.WordTokenizer();
  let tokens = tokenizer.tokenize(lower);

  // 3) очистка токенів від знаків пунктуації та коротких токенів
  tokens = tokens
    .map(t => t.replace(/[^0-9a-zа-яіїєґ\-]/gi, "")) // залишаємо букви/цифри/дефіс
    .filter(Boolean)
    .filter(t => t.length > 2); // відкидаємо короткі слова

  // 4) видаляємо стоп-слова (англ. стоп-слова з пакету + українські)
  const combinedStopwords = sw.en.concat(ukrStopwords);
  tokens = sw.removeStopwords(tokens, combinedStopwords);

  // 5) використовуємо TF-IDF (natural.TfIdf) — додаємо doc як рядок
  const tfidf = new natural.TfIdf();
  tfidf.addDocument(tokens.join(" "));

  // 6) отримуємо список термінів від найбільшого tfidf до найменшого
  const terms = tfidf.listTerms(0)
    .filter(t => t.term.length > 2)
    .slice(0, topN)
    .map(t => t.term);

  // 7) якщо terms порожній, як fallback використаємо простий частотний підрахунок
  if (terms.length === 0) {
    const freq = {};
    tokens.forEach(t => freq[t] = (freq[t] || 0) + 1);
    const sorted = Object.entries(freq)
      .sort((a,b) => b[1] - a[1])
      .slice(0, topN)
      .map(a => a[0]);
    return sorted;
  }

  return terms;
}
