const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');

class TTSService {
  constructor() {
    this.audioDir = path.join(__dirname, '../../temp/audio');
    this.ensureAudioDirectory();
  }

  ensureAudioDirectory() {
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  // Метод для синтезу мови через Google TTS API
  async synthesizeSpeech(text, language = 'uk') {
    try {
      // Генеруємо унікальне ім'я файлу на основі тексту
      const filename = `tts_${Buffer.from(text).toString('base64')}.mp3`;
      const filepath = path.join(this.audioDir, filename);

      // Перевіряємо, чи вже існує аудіофайл для цього тексту
      if (await fs.pathExists(filepath)) {
        return filename;
      }

      // Використовуємо Google Translate TTS (безкоштовний)
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(ttsUrl);
      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.statusText}`);
      }

      const audioBuffer = await response.buffer();
      await fs.writeFile(filepath, audioBuffer);
      
      return filename;
    } catch (error) {
      console.error('TTS synthesis error:', error);
      throw error;
    }
  }

  // Масовий синтез для всіх запитань
  async synthesizeAllQuestions(questions) {
    const audioFiles = [];
    
    for (const question of questions) {
      try {
        const filename = await this.synthesizeSpeech(question.text);
        audioFiles.push({
          questionId: question.id || question.text,
          filename: filename,
          text: question.text
        });
        
        // Затримка для уникнення блокування запитів
        await this.delay(100);
      } catch (error) {
        console.error(`Failed to synthesize: ${question.text}`, error);
        audioFiles.push({
          questionId: question.id || question.text,
          filename: null,
          text: question.text,
          error: error.message
        });
      }
    }
    
    return audioFiles;
  }

  // Отримання шляху до аудіофайлу
  getAudioPath(filename) {
    return path.join(this.audioDir, filename);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new TTSService();