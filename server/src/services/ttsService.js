import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function filenameFromTextHash(text) {
  const hash = crypto.createHash('sha256').update(text).digest('hex'); // 64 chars
  return `tts_${hash}.mp3`;
}

class TTSService {
  constructor() {
    // Нова папка для аудіо на рівні server/audio/
    this.audioDir = path.join(process.cwd(), 'audio', 'tts_cache');
    this.ensureAudioDirectory();
  }

  ensureAudioDirectory() {
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
      console.log('Audio directory created:', this.audioDir);
    }
  }

  // Метод для синтезу мови через Google TTS API
//   async synthesizeSpeech(text, language = 'uk') {
//     try {
//       // Генеруємо унікальне ім'я файлу на основі тексту
//       const filename = filenameFromTextHash(text);
//       const filepath = path.join(this.audioDir, filename);

//       // Перевіряємо, чи вже існує аудіофайл для цього тексту
//       if (await fs.pathExists(filepath)) {
//         console.log('Using cached audio for:', text.substring(0, 50) + '...');
//         return filename;
//       }

//       console.log('Generating new audio for:', text.substring(0, 50) + '...');

//       // Використовуємо Google Translate TTS (безкоштовний)
//       const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodeURIComponent(text)}`;
      
//       const response = await fetch(ttsUrl);
//       if (!response.ok) {
//         throw new Error(`TTS request failed: ${response.statusText}`);
//       }

//       const audioBuffer = await response.buffer();
//       await fs.writeFile(filepath, audioBuffer);
      
//       console.log('Audio file created:', filename);
//       return filename;
//     } catch (error) {
//       console.error('TTS synthesis error:', error);
//       throw error;
//     }
//   }

async synthesizeSpeech(text, language = 'uk') {
  try {
    const filename = filenameFromTextHash(text);
    const filepath = path.join(this.audioDir, filename);

    // Якщо є — повернути
    if (await fs.pathExists(filepath)) {
      console.log('Using cached audio for:', text.substring(0, 50));
      return filename;
    }

    // Тимчасове ім'я
    const tempFilename = `${filename}.tmp`;
    const tempPath = path.join(this.audioDir, tempFilename);

    // Запит TTS
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodeURIComponent(text)}`;
    const response = await fetch(ttsUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Node.js)' } });
    if (!response.ok) throw new Error(`TTS request failed: ${response.status}`);

    // Отримуємо буфер (сумісно і з node-fetch, і з глобальним fetch)
    let audioBuffer;
    if (typeof response.buffer === 'function') {
      audioBuffer = await response.buffer();
    } else {
      const arrayBuffer = await response.arrayBuffer();
      audioBuffer = Buffer.from(arrayBuffer);
    }

    // Пишемо тимчасовий файл, потім перейменовуємо
    await fs.writeFile(tempPath, audioBuffer);
    await fs.rename(tempPath, filepath);

    // Перевірка, що файл існує
    if (!await fs.pathExists(filepath)) {
      throw new Error('File write failed');
    }

    console.log('Audio file created:', filename);
    return filename;
  } catch (err) {
    console.error('TTS synthesis error:', err);
    // видалити тимчасовий файл, якщо є
    try { if (await fs.pathExists(tempPath)) await fs.unlink(tempPath); } catch(e){ }
    throw err;
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

  // Очищення старих аудіофайлів (опціонально)
  async cleanOldAudioFiles(maxAgeHours = 24) {
    try {
      const files = await fs.readdir(this.audioDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;
      
      let cleanedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(this.audioDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          cleanedCount++;
          console.log(`Removed old audio file: ${file}`);
        }
      }
      
      console.log(`Cleaned ${cleanedCount} old audio files`);
    } catch (error) {
      console.error('Error cleaning old audio files:', error.message);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new TTSService();