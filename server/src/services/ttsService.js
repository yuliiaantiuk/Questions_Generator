import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TTSService {
  constructor() {
    this.audioDir = path.join(process.cwd(), 'audio', 'tts_cache');
    this.ensureAudioDirectory();
    console.log('✅ TTS Service initialized - Using Google TTS');
  }

  ensureAudioDirectory() {
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
      console.log('✅ Audio directory created:', this.audioDir);
    }
  }

  // Надійний метод через HTTPS
  synthesizeSpeech(text, language = 'uk') {
    return new Promise((resolve, reject) => {
      try {
        // Унікальне ім'я файлу
        const filename = `tts_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
        const filepath = path.join(this.audioDir, filename);

        console.log('🔊 Downloading TTS audio for:', text.substring(0, 50));

        // Google TTS URL
        const encodedText = encodeURIComponent(text);
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodedText}`;

        const file = fs.createWriteStream(filepath);
        
        const request = https.get(ttsUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`TTS request failed: ${response.statusCode}`));
            return;
          }

          response.pipe(file);

          file.on('finish', () => {
            file.close();
            console.log('✅ Audio file downloaded:', filename);
            
            // Перевіряємо розмір файлу
            fs.stat(filepath, (err, stats) => {
              if (err || stats.size === 0) {
                reject(new Error('Downloaded file is empty'));
              } else {
                resolve(filename);
              }
            });
          });
        });

        request.on('error', (err) => {
          fs.unlink(filepath, () => {}); // Видалити неповний файл
          reject(new Error(`TTS network error: ${err.message}`));
        });

        request.setTimeout(10000, () => {
          request.destroy();
          fs.unlink(filepath, () => {});
          reject(new Error('TTS request timeout'));
        });

      } catch (error) {
        reject(error);
      }
    });
  }


  // Масовий синтез
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
        
        await this.delay(500); // Затримка між запитами
      } catch (error) {
        console.error(`❌ Failed to synthesize: ${question.text}`, error.message);
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

  getAudioPath(filename) {
    return path.join(this.audioDir, filename);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new TTSService();