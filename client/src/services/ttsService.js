// // // // class TTSClientService {
// // // //   constructor() {
// // // //     this.baseURL = 'http://localhost:5000/api/tts';
// // // //     this.playingAudios = new Set();
// // // //     this.audioCache = new Map();
// // // //     this.stopRequested = false; 

// // // //     const nameAbbreviations = {
// // // //         'М.': 'М',
// // // //         'І.': 'І',
// // // //         'П.': 'П',
// // // //         'В.': 'В',
// // // //         'С.': 'С',
// // // //         'О.': 'О'
// // // //     };

// // // //     const englishWords = {
// // // //         'Chat-GPT': 'Чет Джі Пі Ті',
// // // //         'API': 'Ей Пі Ай',
// // // //         'GPT': 'Джі Пі Ті',
// // // //         'AI': 'Ей Ай',
// // // //         'HTML': 'Ейч Ті Ем Ел',
// // // //         'CSS': 'Сі Ес Ес',
// // // //         'JavaScript': 'Джава Скрипт',
// // // //         'Node.js': 'Нод Джей Ес',
// // // //         'React': 'Реакт',
// // // //         'Vue.js': 'Вью Джей Ес',
// // // //         'Angular': 'Енгулар',
// // // //         'TypeScript': 'Тайп Скрипт',
// // // //         'ASAP': 'Ей Ес Ей Пі',
// // // //         'ASCII': 'А Ес Кі',
// // // //         'CPU': 'Сі Пі Ю',
// // // //         'RAM': 'Рем',
// // // //         'USB': 'Ю Ес Бі',
// // // //         'Wi-Fi': 'Вай Фай',
// // // //         'FAQ': 'Еф Ей Кю',
// // // //         'GPS': 'Джі Пі Ес',
// // // //         'URL': 'Ю Ер Ел',
// // // //         'HTTP': 'Ейч Ті Ті Пі',
// // // //         'HTTPS': 'Ейч Ті Ті Пі Ес',
// // // //         'SQL': 'Ес Кю Ел',
// // // //         'JSON': 'Джей Сон',
// // // //         'XML': 'Екс Ем Ел',
// // // //         'IP': 'Ай Пі',
// // // //         'UI': 'Ю Ай',
// // // //         'UX': 'Ю Екс',
// // // //         'GUI': 'Джі Ю Ай',
// // // //         'IDE': 'Ай Ді І',
// // // //         'SDK': 'Ес Ді Кей',
// // // //         'OOP': 'О Оп',
// // // //         'MVC': 'Ем Ві Сі',
// // // //         'KPI': 'Кей Пі Ай',
// // // //         'SEO': 'Ес І О',
// // // //         'PPC': 'Пі Пі Сі',
// // // //         'SaaS': 'Сас',
// // // //         'IoT': 'Ай Оу Ті',
// // // //         'VPN': 'Ві Пі Ен',
// // // //         'AKA': 'Ей Кей Ей',
// // // //         'CI/CD': 'Сі Ай Сі Ді',
// // // //     };
// // // //   }

// // // //  preprocessEnglish(text) {
// // // //   for (const [word, pronunciation] of Object.entries(nameAbbreviations)) {
// // // //     const regex = new RegExp(`\\b${word}\\b`, 'g');
// // // //     text = text.replace(regex, pronunciation);
// // // //   }
// // // //   return text;
// // // //  }

// // // //  romanToArabic(text) {
// // // //         const romanMap = {I:1, V:5, X:10, L:50, C:100, D:500, M:1000};
// // // //         return text.replace(/\b([IVXLCDM]+)\b/g, roman => {
// // // //             let total = 0, prev = 0;
// // // //             for(let i = roman.length - 1; i >= 0; i--) {
// // // //             const curr = romanMap[roman[i]];
// // // //             total += curr < prev ? -curr : curr;
// // // //             prev = curr;
// // // //             }
// // // //             return total;
// // // //         });
// // // //  }

// // // //  preprocessEnglish(text) {
// // // //   for (const [word, pronunciation] of Object.entries(englishWords)) {
// // // //     const regex = new RegExp(`\\b${word}\\b`, 'g');
// // // //     text = text.replace(regex, pronunciation);
// // // //   }
// // // //   return text;
// // // // }

// // // //   async waitForAudio(url, tries = 6, delayMs = 300) {
// // // //     for (let i = 0; i < tries; i++) {
// // // //         try {
// // // //         const r = await fetch(url, { method: 'HEAD' });
// // // //         if (r.ok) return true;
// // // //         } catch (e) {}
// // // //         await this.delay(delayMs);
// // // //     }
// // // //     return false;
// // // //     }

// // // //   // Синтез мови для одного тексту
// // // //   async synthesizeText(text, language = 'uk') {
// // // //     try {
// // // //       // Перевіряємо кеш
// // // //       const cacheKey = `${language}_${text}`;
// // // //       if (this.audioCache.has(cacheKey)) {
// // // //         return this.audioCache.get(cacheKey);
// // // //       }

// // // //       const response = await fetch(`${this.baseURL}/synthesize`, {
// // // //         method: 'POST',
// // // //         headers: {
// // // //           'Content-Type': 'application/json',
// // // //         },
// // // //         body: JSON.stringify({ text, language }),
// // // //       });

// // // //       if (!response.ok) {
// // // //         throw new Error(`HTTP error! status: ${response.status}`);
// // // //       }

// // // //       const data = await response.json();
      
// // // //       if (data.success) {
// // // //         const audioUrl = `${this.baseURL}/audio/${data.filename}`;
// // // //         const ready = await this.waitForAudio(audioUrl);
// // // //         if (!ready) throw new Error('Audio file not ready');
// // // //         this.audioCache.set(cacheKey, audioUrl);
// // // //         return audioUrl;
// // // //       } else {
// // // //         throw new Error(data.error || 'Synthesis failed');
// // // //       }
// // // //     } catch (error) {
// // // //       console.error('TTS client error:', error);
// // // //       throw error;
// // // //     }
// // // //   }

// // // //   // Відтворення аудіо
// // // //   async playAudio(audioUrl) {
// // // //     return new Promise((resolve, reject) => {
// // // //       const audio = new Audio(audioUrl);
// // // //       this.playingAudios.add(audio);

// // // //       const cleanup = () => {
// // // //         audio.onended = null;
// // // //         audio.onerror = null;
// // // //         this.playingAudios.delete(audio);
// // // //       };
      
// // // //       audio.onended = () => {
// // // //         cleanup();
// // // //         resolve();
// // // //       };
      
// // // //       audio.onerror = (error) => {
// // // //         cleanup();
// // // //         reject(error);
// // // //       };
      
// // // //       audio.play().catch(err => {
// // // //         cleanup();
// // // //         reject(err);
// // // //       });
// // // //     });
// // // //   }

// // // //   // Синтез та відтворення одного тексту
// // // //   async speakText(text, language = 'uk') {
// // // //     try {
// // // //       const audioUrl = await this.synthesizeText(text, language);
// // // //       await this.playAudio(audioUrl);
// // // //     } catch (error) {
// // // //       console.error('Speak text error:', error);
// // // //       throw error;
// // // //     }
// // // //   }

// // // //   // Масове озвучення всіх запитань
// // // //   async speakAllQuestions(questions, onProgress = null) {
// // // //   const qs = Array.from(questions).sort(
// // // //     (a, b) => (a.__playOrder || 0) - (b.__playOrder || 0)
// // // //   );

// // // //   this.stopRequested = false;

// // // //   try {
// // // //     if (onProgress) onProgress("Синтез мови...", 0);

// // // //     const audioUrls = [];

// // // //     for (let i = 0; i < qs.length; i++) {
// // // //       if (this.stopRequested) break;

// // // //       const question = qs[i];

// // // //       try {
// // // //         // Синтез аудіо
// // // //         const audioUrl = await this.synthesizeText(question.text, "uk");

// // // //         audioUrls.push({
// // // //           ...question,
// // // //           audioUrl,
// // // //           error: null,
// // // //         });

// // // //         if (onProgress) {
// // // //           onProgress(
// // // //             `Синтезовано ${i + 1} з ${qs.length}`,
// // // //             (i + 1) / qs.length
// // // //           );
// // // //         }
// // // //       } catch (err) {
// // // //         console.error(`Failed to synthesize question ${i + 1}:`, err);

// // // //         audioUrls.push({
// // // //           ...question,
// // // //           audioUrl: null,
// // // //           error: err.message,
// // // //         });
// // // //       }

// // // //       await this.delay(50); // легка пауза
// // // //     }
// // // //     if (onProgress) onProgress("Відтворення...", 1);

// // // //     for (let i = 0; i < audioUrls.length; i++) {
// // // //       if (this.stopRequested) break;

// // // //       const item = audioUrls[i];

// // // //       if (item.audioUrl && !item.error) {
// // // //         if (onProgress) {
// // // //           onProgress(`Запитання ${i + 1} з ${audioUrls.length}`, 1);
// // // //         }

// // // //         await this.playAudio(item.audioUrl);

// // // //         if (i < audioUrls.length - 1) {
// // // //           await this.delay(500);
// // // //         }
// // // //       }
// // // //     }

// // // //     if (onProgress) onProgress("Завершено", 1);
// // // //   } catch (error) {
// // // //     console.error("Speak all questions error:", error);
// // // //     throw error;
// // // //   }
// // // // }


// // // //   delay(ms) {
// // // //     return new Promise(resolve => setTimeout(resolve, ms));
// // // //   }

// // // //   // Зупинка всіх аудіо
// // // // stopAll() {
// // // //     this.stopRequested = true;
// // // //     for (const audio of Array.from(this.playingAudios)) {
// // // //       try {
// // // //         audio.pause();
// // // //         audio.currentTime = 0;
// // // //       } catch (e) { /* ignore */ }
// // // //       this.playingAudios.delete(audio);
// // // //     }
// // // //   }
// // // // }

// // // // export const ttsClient = new TTSClientService();

// // // class TTSClientService {
// // //   constructor() {
// // //     this.baseURL = 'http://localhost:5000/api/tts';
// // //     this.playingAudios = new Set();
// // //     this.audioCache = new Map();
// // //     this.stopRequested = false;

// // //     this.nameAbbreviations = {
// // //       'М.': 'М',
// // //       'І.': 'І',
// // //       'П.': 'П',
// // //       'В.': 'В',
// // //       'С.': 'С',
// // //       'О.': 'О'
// // //     };

// // //     this.englishWords = {
// // //       'Chat-GPT': 'Чет Джі Пі Ті',
// // //       'ChatGPT': 'Чет Джі Пі Ті',
// // //       'API': 'Ей Пі Ай',
// // //       'GPT': 'Джі Пі Ті',
// // //       'AI': 'Ей Ай',
// // //       'HTML': 'Ейч Ті Ем Ел',
// // //       'CSS': 'Сі Ес Ес',
// // //       'JavaScript': 'Джава Скрипт',
// // //       'Node.js': 'Нод Джей Ес',
// // //       'React': 'Реакт',
// // //       'Vue.js': 'Вью Джей Ес',
// // //       'Angular': 'Енгулар',
// // //       'TypeScript': 'Тайп Скрипт',
// // //       'ASAP': 'Ей Ес Ей Пі',
// // //       'ASCII': 'А Ес Кі',
// // //       'CPU': 'Сі Пі Ю',
// // //       'RAM': 'Рем',
// // //       'USB': 'Ю Ес Бі',
// // //       'Wi-Fi': 'Вай Фай',
// // //       'FAQ': 'Еф Ей Кю',
// // //       'GPS': 'Джі Пі Ес',
// // //       'URL': 'Ю Ер Ел',
// // //       'HTTP': 'Ейч Ті Ті Пі',
// // //       'HTTPS': 'Ейч Ті Ті Пі Ес',
// // //       'SQL': 'Ес Кю Ел',
// // //       'JSON': 'Джей Сон',
// // //       'XML': 'Екс Ем Ел',
// // //       'IP': 'Ай Пі',
// // //       'UI': 'Ю Ай',
// // //       'UX': 'Ю Екс',
// // //       'GUI': 'Джі Ю Ай',
// // //       'IDE': 'Ай Ді І',
// // //       'SDK': 'Ес Ді Кей',
// // //       'OOP': 'О Оп',
// // //       'MVC': 'Ем Ві Сі',
// // //       'KPI': 'Кей Пі Ай',
// // //       'SEO': 'Ес І О',
// // //       'PPC': 'Пі Пі Сі',
// // //       'SaaS': 'Сас',
// // //       'IoT': 'Ай Оу Ті',
// // //       'VPN': 'Ві Пі Ен',
// // //       'AKA': 'Ей Кей Ей',
// // //       'CI/CD': 'Сі Ай Сі Ді',
// // //       'Face': 'Фейс',
// // //       'Book': 'Бук',
// // //       'Google': 'Гугл',
// // //     };
// // //   }

// // //   // --- Preprocessing ---
// // //   preprocessText(text) {
// // //     text = this.replaceNameAbbreviations(text);
// // //     text = this.replaceRomanNumbers(text);
// // //     text = this.replaceEnglishWords(text);
// // //     return text;
// // //   }

// // //   replaceNameAbbreviations(text) {
// // //     for (const [abbr, replacement] of Object.entries(this.nameAbbreviations)) {
// // //       const regex = new RegExp(`\\b${abbr}\\b`, 'g');
// // //       text = text.replace(regex, replacement);
// // //     }
// // //     return text;
// // //   }

// // //   replaceRomanNumbers(text) {
// // //     const romanMap = {I:1, V:5, X:10, L:50, C:100, D:500, M:1000};
// // //     return text.replace(/\b([IVXLCDM]+)\b/g, (roman) => {
// // //       let total = 0, prev = 0;
// // //       for (let i = roman.length - 1; i >= 0; i--) {
// // //         const curr = romanMap[roman[i]];
// // //         total += curr < prev ? -curr : curr;
// // //         prev = curr;
// // //       }
// // //       return total;
// // //     });
// // //   }

// // //   replaceEnglishWords(text) {
// // //     for (const [word, pronunciation] of Object.entries(this.englishWords)) {
// // //       const regex = new RegExp(`\\b${word}\\b`, 'g');
// // //       text = text.replace(regex, pronunciation);
// // //     }
// // //     return text;
// // //   }

// // //   // --- Audio synthesis ---
// // //   async waitForAudio(url, tries = 6, delayMs = 300) {
// // //     for (let i = 0; i < tries; i++) {
// // //       try {
// // //         const r = await fetch(url, { method: 'HEAD' });
// // //         if (r.ok) return true;
// // //       } catch (e) {}
// // //       await this.delay(delayMs);
// // //     }
// // //     return false;
// // //   }

// // //   async synthesizeText(text, language = 'uk') {
// // //     try {
// // //       const preprocessedText = this.preprocessText(text);
// // //       const cacheKey = `${language}_${preprocessedText}`;
// // //       if (this.audioCache.has(cacheKey)) {
// // //         return this.audioCache.get(cacheKey);
// // //       }

// // //       const response = await fetch(`${this.baseURL}/synthesize`, {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({ text: preprocessedText, language })
// // //       });

// // //       if (!response.ok) {
// // //         throw new Error(`HTTP error! status: ${response.status}`);
// // //       }

// // //       const data = await response.json();

// // //       if (data.success) {
// // //         const audioUrl = `${this.baseURL}/audio/${data.filename}`;
// // //         const ready = await this.waitForAudio(audioUrl);
// // //         if (!ready) throw new Error('Audio file not ready');
// // //         this.audioCache.set(cacheKey, audioUrl);
// // //         return audioUrl;
// // //       } else {
// // //         throw new Error(data.error || 'Synthesis failed');
// // //       }
// // //     } catch (error) {
// // //       console.error('TTS client error:', error);
// // //       throw error;
// // //     }
// // //   }

// // //   async playAudio(audioUrl) {
// // //     return new Promise((resolve, reject) => {
// // //       const audio = new Audio(audioUrl);
// // //       this.playingAudios.add(audio);

// // //       const cleanup = () => {
// // //         audio.onended = null;
// // //         audio.onerror = null;
// // //         this.playingAudios.delete(audio);
// // //       };

// // //       audio.onended = () => {
// // //         cleanup();
// // //         resolve();
// // //       };
// // //       audio.onerror = (err) => {
// // //         cleanup();
// // //         reject(err);
// // //       };
// // //       audio.play().catch(err => {
// // //         cleanup();
// // //         reject(err);
// // //       });
// // //     });
// // //   }

// // //   async speakText(text, language = 'uk') {
// // //     const audioUrl = await this.synthesizeText(text, language);
// // //     await this.playAudio(audioUrl);
// // //   }

// // //   async speakAllQuestions(questions, onProgress = null) {
// // //     const qs = Array.from(questions).sort((a, b) => (a.__playOrder || 0) - (b.__playOrder || 0));
// // //     this.stopRequested = false;

// // //     try {
// // //       if (onProgress) onProgress("Синтез мови...", 0);

// // //       const audioUrls = [];

// // //       for (let i = 0; i < qs.length; i++) {
// // //         if (this.stopRequested) break;
// // //         const question = qs[i];

// // //         try {
// // //           const audioUrl = await this.synthesizeText(question.text, "uk");
// // //           audioUrls.push({ ...question, audioUrl, error: null });

// // //           if (onProgress) onProgress(`Синтезовано ${i + 1} з ${qs.length}`, (i + 1) / qs.length);
// // //         } catch (err) {
// // //           console.error(`Failed to synthesize question ${i + 1}:`, err);
// // //           audioUrls.push({ ...question, audioUrl: null, error: err.message });
// // //         }

// // //         await this.delay(50);
// // //       }

// // //       if (onProgress) onProgress("Відтворення...", 1);

// // //       for (let i = 0; i < audioUrls.length; i++) {
// // //         if (this.stopRequested) break;
// // //         const item = audioUrls[i];

// // //         if (item.audioUrl && !item.error) {
// // //           if (onProgress) onProgress(`Запитання ${i + 1} з ${audioUrls.length}`, 1);
// // //           await this.playAudio(item.audioUrl);
// // //           if (i < audioUrls.length - 1) await this.delay(500);
// // //         }
// // //       }

// // //       if (onProgress) onProgress("Завершено", 1);
// // //     } catch (error) {
// // //       console.error("Speak all questions error:", error);
// // //       throw error;
// // //     }
// // //   }

// // //   delay(ms) {
// // //     return new Promise(resolve => setTimeout(resolve, ms));
// // //   }

// // //   stopAll() {
// // //     this.stopRequested = true;
// // //     for (const audio of Array.from(this.playingAudios)) {
// // //       try {
// // //         audio.pause();
// // //         audio.currentTime = 0;
// // //       } catch (e) {}
// // //       this.playingAudios.delete(audio);
// // //     }
// // //   }
// // // }

// // // export const ttsClient = new TTSClientService();

// // class TTSClientService {
// //   constructor() {
// //     this.baseURL = 'http://localhost:5000/api/tts';
// //     this.playingAudios = new Set();
// //     this.audioCache = new Map();
// //     this.stopRequested = false;


// //     // Скорочення імен (залишаємо)
// //     this.nameAbbreviations = {
// //       'М.': 'М',
// //       'І.': 'І',
// //       'П.': 'П',
// //       'В.': 'В',
// //       'С.': 'С',
// //       'О.': 'О'
// //     };
// //   }

// //   isEnglishWord(word) {
// //     return /[A-Za-z]/.test(word);
// //   }

// //   splitByLanguage(text) {
// //   const words = text.split(/(\s+)/);
// //   const segments = [];

// //   let currentLang = null;
// //   let currentText = '';

// //   for (let w of words) {
// //     const isEn = /[A-Za-z]/.test(w);
// //     const lang = isEn ? 'en' : 'uk';

// //     if (currentLang === null) {
// //       currentLang = lang;
// //       currentText = w;
// //     } else if (lang === currentLang) {
// //       currentText += w;
// //     } else {
// //       const cleaned = currentText.trim();
// //       if (cleaned.length > 0) {
// //         segments.push({ lang: currentLang, text: cleaned });
// //       }
// //       currentLang = lang;
// //       currentText = w;
// //     }
// //   }

// //   const cleaned = currentText.trim();
// //   if (cleaned.length > 0) {
// //     segments.push({ lang: currentLang, text: cleaned });
// //   }

// //   return segments;
// // }

// //   preprocessText(text) {
// //     // Скорочення імен
// //     for (const [abbr, rep] of Object.entries(this.nameAbbreviations)) {
// //       const regex = new RegExp(`\\b${abbr}\\b`, 'g');
// //       text = text.replace(regex, rep);
// //     }

// //     // Римські числа → арабські
// //     const romanMap = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
// //     text = text.replace(/\b([IVXLCDM]+)\b/g, roman => {
// //       let total = 0, prev = 0;
// //       for (let i = roman.length - 1; i >= 0; i--) {
// //         const curr = romanMap[roman[i]];
// //         total += curr < prev ? -curr : curr;
// //         prev = curr;
// //       }
// //       return total;
// //     });

// //     return text;
// //   }

// //   async waitForAudio(url, tries = 6, delayMs = 300) {
// //     for (let i = 0; i < tries; i++) {
// //       try {
// //         const r = await fetch(url, { method: 'HEAD' });
// //         if (r.ok) return true;
// //       } catch {}
// //       await this.delay(delayMs);
// //     }
// //     return false;
// //   }

// //   async synthesizeSegment(text, lang) {
// //     const cacheKey = `${lang}_${text}`;
// //     if (this.audioCache.has(cacheKey)) return this.audioCache.get(cacheKey);

// //     const response = await fetch(`${this.baseURL}/synthesize`, {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({ text, language: lang })
// //     });

// //     const data = await response.json();
// //     if (!data.success) throw new Error(data.error || 'TTS failed');

// //     const audioUrl = `${this.baseURL}/audio/${data.filename}`;
// //     await this.waitForAudio(audioUrl);
// //     this.audioCache.set(cacheKey, audioUrl);
// //     return audioUrl;
// //   }

// //   async synthesizeText(text) {
// //     const pre = this.preprocessText(text);

// //     const segments = this.splitByLanguage(pre);

// //     const urls = [];
// //     for (const seg of segments) {
// //       urls.push(await this.synthesizeSegment(seg.text, seg.lang));
// //     }
// //     return urls; // повертаємо список аудіо
// //   }

// //   async playAudio(url) {
// //     return new Promise((resolve, reject) => {
// //       const audio = new Audio(url);
// //       this.playingAudios.add(audio);

// //       audio.onended = () => {
// //         this.playingAudios.delete(audio);
// //         resolve();
// //       };
// //       audio.onerror = err => {
// //         this.playingAudios.delete(audio);
// //         reject(err);
// //       };

// //       audio.play();
// //     });
// //   }

// //   delay(ms) {
// //     return new Promise(res => setTimeout(res, ms));
// //   }

// //   stopAll() {
// //     this.stopRequested = true;
// //     for (const audio of Array.from(this.playingAudios)) {
// //       try { audio.pause(); audio.currentTime = 0; } catch {}
// //       this.playingAudios.delete(audio);
// //     }
// //   }


// //   async speakAllQuestions(questions, onProgress = null) {
// //     this.stopRequested = false;

// //     for (let i = 0; i < questions.length; i++) {
// //       if (this.stopRequested) break;

// //       const q = questions[i];
// //       const typeIntro = this.getQuestionIntro(q.type);

// //       const fullText = `${typeIntro}. ${q.text}`;
// //       const audioParts = await this.synthesizeText(fullText);

// //       // програємо питання
// //       for (const part of audioParts) {
// //         if (this.stopRequested) break;
// //         await this.playAudio(part);
// //       }

// //       // програємо варіанти
// //       if (q.options) {
// //         const optIntro = await this.synthesizeText("Варіанти відповідей:");
// //         for (const p of optIntro) await this.playAudio(p);

// //         for (const opt of q.options) {
// //           const optAudio = await this.synthesizeText(opt);
// //           for (const p of optAudio) await this.playAudio(p);
// //         }
// //       }

// //       if (onProgress) {
// //         onProgress(`Синтезовано ${i + 1} з ${questions.length}`, (i + 1) / questions.length);
// //       }
// //     }

// //     if (onProgress) onProgress("Завершено", 1);
// //   }

// //   getQuestionIntro(type) {
// //     switch(type) {
// //       case 'singleChoice': return 'Питання з однією правильною відповіддю';
// //       case 'multipleChoice': return 'Питання з кількома правильними відповідями';
// //       case 'trueFalse': return 'Правда чи неправда';
// //       case 'shortAnswer': return 'Питання з короткою відповіддю';
// //     }
// //     return 'Питання';
// //   }
// // }

// // export const ttsClient = new TTSClientService();

// class TTSClientService {
//   constructor() {
//     this.baseURL = 'http://localhost:5000/api/tts';
//     this.audioCache = new Map();
//     this.stopRequested = false;
    
//     console.log('🔊 TTS Client initialized - Using SERVER TTS (browser independent)');
//   }

//   // Основний метод - використовує серверний TTS
//   async synthesizeText(text) {
//     try {
//       console.log('🔊 Requesting server TTS for:', text.substring(0, 50));

//       const response = await fetch(`${this.baseURL}/synthesize`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text, language: 'uk' }),
//       });

//       if (!response.ok) {
//         throw new Error(`Server TTS error: ${response.status}`);
//       }

//       const data = await response.json();
      
//       if (data.success) {
//         const audioUrl = `${this.baseURL}/audio/${data.filename}`;
//         console.log('✅ Server TTS successful, audio URL:', audioUrl);
//         return audioUrl;
//       } else {
//         throw new Error(data.error || 'Server TTS failed');
//       }
//     } catch (error) {
//       console.error('❌ Server TTS failed:', error);
//       throw error;
//     }
//   }

//   // Відтворення аудіо
//   async playAudio(audioUrl) {
//     return new Promise((resolve, reject) => {
//       console.log('🎵 Playing audio from:', audioUrl);
      
//       const audio = new Audio(audioUrl);
      
//       audio.onloadeddata = () => {
//         console.log('✅ Audio loaded, starting playback');
//       };
      
//       audio.onended = () => {
//         console.log('✅ Audio playback completed');
//         resolve();
//       };
      
//       audio.onerror = (error) => {
//         console.error('❌ Audio playback error:', error);
//         reject(error);
//       };

//       // Додаємо параметри для надійності
//       audio.preload = 'auto';
//       audio.crossOrigin = 'anonymous';
      
//       const playPromise = audio.play();
      
//       if (playPromise !== undefined) {
//         playPromise.catch(error => {
//           console.error('❌ Audio play() failed:', error);
//           reject(error);
//         });
//       }
//     });
//   }

//   // Озвучення всіх запитань
//   async speakAllQuestions(questions) {
//     this.stopRequested = false;
//     console.log('🔊 Starting to speak all questions via SERVER TTS');

//     try {
//       for (let i = 0; i < questions.length; i++) {
//         if (this.stopRequested) {
//           console.log('⏹️ Stopping requested');
//           break;
//         }

//         const question = questions[i];
//         console.log(`🔊 Processing question ${i + 1}/${questions.length}`);

//         try {
//           // Отримуємо аудіо URL з сервера
//           const audioUrl = await this.synthesizeText(question.text);
          
//           // Відтворюємо аудіо
//           await this.playAudio(audioUrl);
          
//           console.log(`✅ Question ${i + 1} completed`);
          
//           // Пауза між запитаннями
//           if (i < questions.length - 1) {
//             await this.delay(1000);
//           }
          
//         } catch (questionError) {
//           console.error(`❌ Failed to process question ${i + 1}:`, questionError);
//           // Продовжуємо з наступним питанням
//           continue;
//         }
//       }

//       console.log('✅ All questions completed');
      
//     } catch (error) {
//       console.error('❌ Error in speakAllQuestions:', error);
//       throw error;
//     }
//   }

//   // Зупинка
//   stopAll() {
//     console.log('⏹️ Stopping all TTS');
//     this.stopRequested = true;
    
//     // Зупиняємо всі аудіо елементи
//     const audioElements = document.querySelectorAll('audio');
//     audioElements.forEach(audio => {
//       audio.pause();
//       audio.currentTime = 0;
//     });
//   }

//   // Затримка
//   delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }

//   // Перевірка стану сервера
//   async checkServerStatus() {
//     try {
//       const response = await fetch(`${this.baseURL}/audio/test.mp3`, { method: 'HEAD' });
//       return response.ok;
//     } catch {
//       return false;
//     }
//   }
// }

// export const ttsClient = new TTSClientService();

// class TTSClientService {
//   constructor() {
//     this.baseURL = 'http://localhost:5000/api/tts';
//     this.playingAudios = new Set();
//     this.audioCache = new Map();
//     this.stopRequested = false;

//     this.nameAbbreviations = {
//       'М.': 'М',
//       'І.': 'І',
//       'П.': 'П',
//       'В.': 'В',
//       'С.': 'С',
//       'О.': 'О'
//     };
//   }

//   englishToUkPhonetic(text) {
//     const replacements = [
//       [/th/gi, 'т'],
//       [/ph/gi, 'ф'],
//       [/ch/gi, 'ч'],
//       [/sh/gi, 'ш'],
//       [/ou/gi, 'ау'],
//       [/oo/gi, 'у'],
//       [/ee/gi, 'і'],
//     ];

//     for (const [pattern, repl] of replacements) {
//       text = text.replace(pattern, repl);
//     }

//     text = text.replace(/[a-zA-Z]/g, (l) => {
//       const map = {
//         a: 'е', b: 'б', c: 'с', d: 'д', e: 'і', f: 'ф',
//         g: 'г', h: 'х', i: 'ай', j: 'дж', k: 'к', l: 'л',
//         m: 'м', n: 'н', o: 'о', p: 'п', q: 'к', r: 'р',
//         s: 'с', t: 'т', u: 'ю', v: 'в', w: 'в', x: 'кс',
//         y: 'й', z: 'з',
//         A: 'Е', B: 'Б', C: 'С', D: 'Д', E: 'І', F: 'Ф',
//         G: 'Г', H: 'Х', I: 'Ай', J: 'Дж', K: 'К', L: 'Л',
//         M: 'М', N: 'Н', O: 'О', P: 'П', Q: 'К', R: 'Р',
//         S: 'С', T: 'Т', U: 'Ю', V: 'В', W: 'В', X: 'Кс',
//         Y: 'Й', Z: 'З'
//       };
//       return map[l] || l;
//     });

//     return text;
//   }

//   preprocessText(text) {
//     for (const [abbr, rep] of Object.entries(this.nameAbbreviations)) {
//       const regex = new RegExp(`\\b${abbr}\\b`, 'g');
//       text = text.replace(regex, rep);
//     }

//     const romanMap = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
//     text = text.replace(/\b([IVXLCDM]+)\b/g, roman => {
//       let total = 0, prev = 0;
//       for (let i = roman.length - 1; i >= 0; i--) {
//         const curr = romanMap[roman[i]];
//         total += curr < prev ? -curr : curr;
//         prev = curr;
//       }
//       return total;
//     });

//     text = this.englishToUkPhonetic(text);

//     return text;
//   }

//   isEnglishWord(word) {
//     return /[A-Za-z]/.test(word);
//   }

//   splitByLanguage(text) {
//     const words = text.split(/(\s+)/);
//     const segments = [];

//     let currentLang = null;
//     let currentText = '';

//     for (let w of words) {
//       const isEn = /[A-Za-z]/.test(w);
//       const lang = isEn ? 'en' : 'uk';

//       if (currentLang === null) {
//         currentLang = lang;
//         currentText = w;
//       } else if (lang === currentLang) {
//         currentText += w;
//       } else {
//         const cleaned = currentText.trim();
//         if (cleaned.length > 0) {
//           segments.push({ lang: currentLang, text: cleaned });
//         }
//         currentLang = lang;
//         currentText = w;
//       }
//     }

//     const cleaned = currentText.trim();
//     if (cleaned.length > 0) {
//       segments.push({ lang: currentLang, text: cleaned });
//     }

//     return segments;
//   }

//   preprocessText(text) {
//     // Скорочення імен
//     for (const [abbr, rep] of Object.entries(this.nameAbbreviations)) {
//       const regex = new RegExp(`\\b${abbr}\\b`, 'g');
//       text = text.replace(regex, rep);
//     }

//     // Римські числа → арабські
//     const romanMap = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
//     text = text.replace(/\b([IVXLCDM]+)\b/g, roman => {
//       let total = 0, prev = 0;
//       for (let i = roman.length - 1; i >= 0; i--) {
//         const curr = romanMap[roman[i]];
//         total += curr < prev ? -curr : curr;
//         prev = curr;
//       }
//       return total;
//     });

//     return text;
//   }

//   async waitForAudio(url, tries = 6, delayMs = 300) {
//     for (let i = 0; i < tries; i++) {
//       try {
//         const r = await fetch(url, { method: 'HEAD' });
//         if (r.ok) return true;
//       } catch {}
//       await this.delay(delayMs);
//     }
//     return false;
//   }

//   async synthesizeSegment(text, lang) {
//     const cacheKey = `uk_${text}`; // Змінили на українську для всіх
//     if (this.audioCache.has(cacheKey)) return this.audioCache.get(cacheKey);

//     const response = await fetch(`${this.baseURL}/synthesize`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ text, language: 'uk' }) // Завжди українська
//     });

//     const data = await response.json();
//     if (!data.success) throw new Error(data.error || 'TTS failed');

//     const audioUrl = `${this.baseURL}/audio/${data.filename}`;
//     await this.waitForAudio(audioUrl);
//     this.audioCache.set(cacheKey, audioUrl);
//     return audioUrl;
//   }

//   async synthesizeText(text) {
//     const pre = this.preprocessText(text);

//     const segments = this.splitByLanguage(pre);

//     const urls = [];
//     for (const seg of segments) {
//       // ⚠️ ВИПРАВЛЕННЯ: ІГНОРУЄМО МОВУ СЕГМЕНТА, ВИКОРИСТОВУЄМО УКРАЇНСЬКУ
//       urls.push(await this.synthesizeSegment(seg.text, 'uk')); // Завжди українська
//     }
//     return urls;
//   }

//   async playAudio(url) {
//     return new Promise((resolve, reject) => {
//       const audio = new Audio(url);
//       this.playingAudios.add(audio);

//       audio.onended = () => {
//         this.playingAudios.delete(audio);
//         resolve();
//       };
//       audio.onerror = err => {
//         this.playingAudios.delete(audio);
//         reject(err);
//       };

//       audio.play();
//     });
//   }

//   delay(ms) {
//     return new Promise(res => setTimeout(res, ms));
//   }

//   stopAll() {
//     this.stopRequested = true;
//     for (const audio of Array.from(this.playingAudios)) {
//       try { audio.pause(); audio.currentTime = 0; } catch {}
//       this.playingAudios.delete(audio);
//     }
//   }

//   async speakAllQuestions(questions, onProgress = null) {
//     this.stopRequested = false;

//     for (let i = 0; i < questions.length; i++) {
//       if (this.stopRequested) break;

//       const q = questions[i];
//       const typeIntro = this.getQuestionIntro(q.type);

//       const fullText = `${typeIntro}. ${q.text}`;
//       const audioParts = await this.synthesizeText(fullText);

//       for (const part of audioParts) {
//         if (this.stopRequested) break;
//         await this.playAudio(part);
//       }

//       if (q.options) {
//         const optIntro = await this.synthesizeText("Варіанти відповідей:");
//         for (const p of optIntro) await this.playAudio(p);

//         for (const opt of q.options) {
//           const optAudio = await this.synthesizeText(opt);
//           for (const p of optAudio) await this.playAudio(p);
//         }
//       }

//       if (onProgress) {
//         onProgress(`Синтезовано ${i + 1} з ${questions.length}`, (i + 1) / questions.length);
//       }
//     }

//     if (onProgress) onProgress("Завершено", 1);
//   }

//   getQuestionIntro(type) {
//     switch(type) {
//       case 'singleChoice': return 'Питання з однією правильною відповіддю';
//       case 'multipleChoice': return 'Питання з кількома правильними відповідями';
//       case 'trueFalse': return 'Правда чи неправда';
//       case 'shortAnswer': return 'Питання з короткою відповіддю';
//     }
//     return 'Питання';
//   }
// }

// export const ttsClient = new TTSClientService();

class TTSClientService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/tts';
    this.playingAudios = new Set();
    this.audioCache = new Map();
    this.stopRequested = false;

    this.nameAbbreviations = {
      'М.': 'М',
      'І.': 'І',
      'П.': 'П',
      'В.': 'В',
      'С.': 'С',
      'О.': 'О'
    };
  }

  englishToUkPhonetic(text) {
    const replacements = [
      [/th/gi, 'т'],
      [/ph/gi, 'ф'],
      [/ch/gi, 'ч'],
      [/sh/gi, 'ш'],
      [/ou/gi, 'ау'],
      [/oo/gi, 'у'],
      [/ee/gi, 'і'],
    ];

    for (const [pattern, repl] of replacements) {
      text = text.replace(pattern, repl);
    }

    text = text.replace(/[a-zA-Z]/g, (l) => {
      const map = {
        a: 'е', b: 'б', c: 'с', d: 'д', e: 'і', f: 'ф',
        g: 'г', h: 'х', i: 'ай', j: 'дж', k: 'к', l: 'л',
        m: 'м', n: 'н', o: 'о', p: 'п', q: 'к', r: 'р',
        s: 'с', t: 'т', u: 'ю', v: 'в', w: 'в', x: 'кс',
        y: 'й', z: 'з',
        A: 'Е', B: 'Б', C: 'С', D: 'Д', E: 'І', F: 'Ф',
        G: 'Г', H: 'Х', I: 'Ай', J: 'Дж', K: 'К', L: 'Л',
        M: 'М', N: 'Н', O: 'О', P: 'П', Q: 'К', R: 'Р',
        S: 'С', T: 'Т', U: 'Ю', V: 'В', W: 'В', X: 'Кс',
        Y: 'Й', Z: 'З'
      };
      return map[l] || l;
    });

    return text;
  }

  preprocessText(text) {
    for (const [abbr, rep] of Object.entries(this.nameAbbreviations)) {
      const regex = new RegExp(`\\b${abbr}\\b`, 'g');
      text = text.replace(regex, rep);
    }

    const romanMap = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
    text = text.replace(/\b([IVXLCDM]+)\b/g, roman => {
      let total = 0, prev = 0;
      for (let i = roman.length - 1; i >= 0; i--) {
        const curr = romanMap[roman[i]];
        total += curr < prev ? -curr : curr;
        prev = curr;
      }
      return total;
    });

    text = this.englishToUkPhonetic(text);

    return text;
  }

  isEnglishWord(word) {
    return /[A-Za-z]/.test(word);
  }

  splitByLanguage(text) {
    const words = text.split(/(\s+)/);
    const segments = [];

    let currentLang = null;
    let currentText = '';

    for (let w of words) {
      const isEn = /[A-Za-z]/.test(w);
      const lang = isEn ? 'en' : 'uk';

      if (currentLang === null) {
        currentLang = lang;
        currentText = w;
      } else if (lang === currentLang) {
        currentText += w;
      } else {
        const cleaned = currentText.trim();
        if (cleaned.length > 0) {
          segments.push({ lang: currentLang, text: cleaned });
        }
        currentLang = lang;
        currentText = w;
      }
    }

    const cleaned = currentText.trim();
    if (cleaned.length > 0) {
      segments.push({ lang: currentLang, text: cleaned });
    }

    return segments;
  }

  preprocessText(text) {
    // Скорочення імен
    for (const [abbr, rep] of Object.entries(this.nameAbbreviations)) {
      const regex = new RegExp(`\\b${abbr}\\b`, 'g');
      text = text.replace(regex, rep);
    }

    // Римські числа → арабські
    const romanMap = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
    text = text.replace(/\b([IVXLCDM]+)\b/g, roman => {
      let total = 0, prev = 0;
      for (let i = roman.length - 1; i >= 0; i--) {
        const curr = romanMap[roman[i]];
        total += curr < prev ? -curr : curr;
        prev = curr;
      }
      return total;
    });

    return text;
  }

  async waitForAudio(url, tries = 6, delayMs = 300) {
    for (let i = 0; i < tries; i++) {
      try {
        const r = await fetch(url, { method: 'HEAD' });
        if (r.ok) return true;
      } catch {}
      await this.delay(delayMs);
    }
    return false;
  }

  async speakQuestion(question) {
    this.stopRequested = false;

    const typeIntro = this.getQuestionIntro(question.type);
    const fullText = `${typeIntro}. ${question.text}`;

    try {
      // Синтезуємо аудіо
      const audioParts = await this.synthesizeText(fullText);

      for (const part of audioParts) {
        if (this.stopRequested) break;
        await this.playAudio(part);
      }

      // Додатково: озвучити варіанти відповідей
      if (question.options) {
        const optIntro = await this.synthesizeText("Варіанти відповідей:");
        for (const p of optIntro) if (!this.stopRequested) await this.playAudio(p);

        for (const opt of question.options) {
          const optAudio = await this.synthesizeText(opt);
          for (const p of optAudio) if (!this.stopRequested) await this.playAudio(p);
        }
      }

    } catch (error) {
      console.error('❌ TTS failed for question:', question.text, error);
      alert('Помилка озвучення питання: ' + error.message);
    }
  }

  async synthesizeSegment(text, lang) {
    const cacheKey = `uk_${text}`; // Змінили на українську для всіх
    if (this.audioCache.has(cacheKey)) return this.audioCache.get(cacheKey);

    const response = await fetch(`${this.baseURL}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: 'uk' }) // Завжди українська
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'TTS failed');

    const audioUrl = `${this.baseURL}/audio/${data.filename}`;
    await this.waitForAudio(audioUrl);
    this.audioCache.set(cacheKey, audioUrl);
    return audioUrl;
  }

  async synthesizeText(text) {
    const pre = this.preprocessText(text);

    const segments = this.splitByLanguage(pre);

    const urls = [];
    for (const seg of segments) {
      // ⚠️ ВИПРАВЛЕННЯ: ІГНОРУЄМО МОВУ СЕГМЕНТА, ВИКОРИСТОВУЄМО УКРАЇНСЬКУ
      urls.push(await this.synthesizeSegment(seg.text, 'uk')); // Завжди українська
    }
    return urls;
  }

  async playAudio(url) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      this.playingAudios.add(audio);

      audio.onended = () => {
        this.playingAudios.delete(audio);
        resolve();
      };
      audio.onerror = err => {
        this.playingAudios.delete(audio);
        reject(err);
      };

      audio.play();
    });
  }

  delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  stopAll() {
    this.stopRequested = true;
    for (const audio of Array.from(this.playingAudios)) {
      try { audio.pause(); audio.currentTime = 0; } catch {}
      this.playingAudios.delete(audio);
    }
  }

  async speakAllQuestions(questions, onProgress = null) {
    this.stopRequested = false;

    for (let i = 0; i < questions.length; i++) {
      if (this.stopRequested) break;

      const q = questions[i];
      const typeIntro = this.getQuestionIntro(q.type);

      const fullText = `${typeIntro}. ${q.text}`;
      const audioParts = await this.synthesizeText(fullText);

      for (const part of audioParts) {
        if (this.stopRequested) break;
        await this.playAudio(part);
      }

      if (q.options) {
        const optIntro = await this.synthesizeText("Варіанти відповідей:");
        for (const p of optIntro) await this.playAudio(p);

        for (const opt of q.options) {
          const optAudio = await this.synthesizeText(opt);
          for (const p of optAudio) await this.playAudio(p);
        }
      }

      if (onProgress) {
        onProgress(`Синтезовано ${i + 1} з ${questions.length}`, (i + 1) / questions.length);
      }
    }

    if (onProgress) onProgress("Завершено", 1);
  }

  getQuestionIntro(type) {
    switch(type) {
      case 'singleChoice': return 'Питання з однією правильною відповіддю';
      case 'multipleChoice': return 'Питання з кількома правильними відповідями';
      case 'trueFalse': return 'Правда чи неправда';
      case 'shortAnswer': return 'Питання з короткою відповіддю';
    }
    return 'Питання';
  }
}

export const ttsClient = new TTSClientService();