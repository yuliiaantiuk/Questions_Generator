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