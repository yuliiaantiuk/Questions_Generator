// // import fs from 'fs-extra';
// // import path from 'path';
// // import { fileURLToPath } from 'url';
// // import fetch from 'node-fetch';
// // import crypto from 'crypto';

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // function filenameFromTextHash(text) {
// //   const hash = crypto.createHash('sha256').update(text).digest('hex'); // 64 chars
// //   return `tts_${hash}.mp3`;
// // }

// // class TTSService {
// //   constructor() {
// //     // Нова папка для аудіо на рівні server/audio/
// //     this.audioDir = path.join(process.cwd(), 'audio', 'tts_cache');
// //     this.ensureAudioDirectory();
// //     this.audioCache = new Map();
// //   }

// //   ensureAudioDirectory() {
// //     if (!fs.existsSync(this.audioDir)) {
// //       fs.mkdirSync(this.audioDir, { recursive: true });
// //       console.log('Audio directory created:', this.audioDir);
// //     }
// //   }

// //   // Метод для синтезу мови через Google TTS API
// // //   async synthesizeSpeech(text, language = 'uk') {
// // //     try {
// // //       // Генеруємо унікальне ім'я файлу на основі тексту
// // //       const filename = filenameFromTextHash(text);
// // //       const filepath = path.join(this.audioDir, filename);

// // //       // Перевіряємо, чи вже існує аудіофайл для цього тексту
// // //       if (await fs.pathExists(filepath)) {
// // //         console.log('Using cached audio for:', text.substring(0, 50) + '...');
// // //         return filename;
// // //       }

// // //       console.log('Generating new audio for:', text.substring(0, 50) + '...');

// // //       // Використовуємо Google Translate TTS (безкоштовний)
// // //       const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodeURIComponent(text)}`;
      
// // //       const response = await fetch(ttsUrl);
// // //       if (!response.ok) {
// // //         throw new Error(`TTS request failed: ${response.statusText}`);
// // //       }

// // //       const audioBuffer = await response.buffer();
// // //       await fs.writeFile(filepath, audioBuffer);
      
// // //       console.log('Audio file created:', filename);
// // //       return filename;
// // //     } catch (error) {
// // //       console.error('TTS synthesis error:', error);
// // //       throw error;
// // //     }
// // //   }

// // // async synthesizeSpeech(text, language = 'uk') {
// // //   try {
// // //     const filename = filenameFromTextHash(text);
// // //     const filepath = path.join(this.audioDir, filename);

// // //     // Якщо є — повернути
// // //     if (await fs.pathExists(filepath)) {
// // //       console.log('Using cached audio for:', text.substring(0, 50));
// // //       return filename;
// // //     }

// // //     // Тимчасове ім'я
// // //     const tempFilename = `${filename}.tmp`;
// // //     const tempPath = path.join(this.audioDir, tempFilename);

// // //     // Запит TTS
// // //     const REAL_LANGUAGE = 'en';
// // //     const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${REAL_LANGUAGE}&client=tw-ob&q=${encodeURIComponent(text)}`;
// // //     const response = await fetch(ttsUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Node.js)' } });
// // //     if (!response.ok) throw new Error(`TTS request failed: ${response.status}`);

// // //     // Отримуємо буфер (сумісно і з node-fetch, і з глобальним fetch)
// // //     let audioBuffer;
// // //     if (typeof response.buffer === 'function') {
// // //       audioBuffer = await response.buffer();
// // //     } else {
// // //       const arrayBuffer = await response.arrayBuffer();
// // //       audioBuffer = Buffer.from(arrayBuffer);
// // //     }

// // //     // Пишемо тимчасовий файл, потім перейменовуємо
// // //     await fs.writeFile(tempPath, audioBuffer);
// // //     await fs.rename(tempPath, filepath);

// // //     // Перевірка, що файл існує
// // //     if (!await fs.pathExists(filepath)) {
// // //       throw new Error('File write failed');
// // //     }

// // //     console.log('Audio file created:', filename);
// // //     return filename;
// // //   } catch (err) {
// // //     console.error('TTS synthesis error:', err);
// // //     // видалити тимчасовий файл, якщо є
// // //     try { if (await fs.pathExists(tempPath)) await fs.unlink(tempPath); } catch(e){ }
// // //     throw err;
// // //   }
// // // }

// // async synthesizeSpeech(text, language = 'uk') {
// //   const cacheKey = `${language}_${text}`;
// //   if (this.audioCache.has(cacheKey)) return this.audioCache.get(cacheKey);

// //   const response = await fetch("http://127.0.0.1:8001/synthesize", {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify({ text, language })
// //   });

// //   const data = await response.json();
// //   if (!data.success) throw new Error(data.detail || "TTS failed");

// //   // Тепер копіюємо файл з python/audio_cache в node/audio/tts_cache
// //   const src = data.path;
// //   const dest = path.join(this.audioDir, data.filename);
// //   await fs.copyFile(src, dest);

// //   const audioUrl = `/api/tts/audio/${data.filename}`;
// //   this.audioCache.set(cacheKey, audioUrl);
// //   return audioUrl;
// // }


// //   // Масовий синтез для всіх запитань
// //   async synthesizeAllQuestions(questions) {
// //     const audioFiles = [];
    
// //     for (const question of questions) {
// //       try {
// //         const filename = await this.synthesizeSpeech(question.text);
// //         audioFiles.push({
// //           questionId: question.id || question.text,
// //           filename: filename,
// //           text: question.text
// //         });
        
// //         // Затримка для уникнення блокування запитів
// //         await this.delay(100);
// //       } catch (error) {
// //         console.error(`Failed to synthesize: ${question.text}`, error);
// //         audioFiles.push({
// //           questionId: question.id || question.text,
// //           filename: null,
// //           text: question.text,
// //           error: error.message
// //         });
// //       }
// //     }
    
// //     return audioFiles;
// //   }

// //   // Отримання шляху до аудіофайлу
// //   getAudioPath(filename) {
// //     return path.join(this.audioDir, filename);
// //   }

// //   // Очищення старих аудіофайлів (опціонально)
// //   async cleanOldAudioFiles(maxAgeHours = 24) {
// //     try {
// //       const files = await fs.readdir(this.audioDir);
// //       const now = Date.now();
// //       const maxAge = maxAgeHours * 60 * 60 * 1000;
      
// //       let cleanedCount = 0;
      
// //       for (const file of files) {
// //         const filePath = path.join(this.audioDir, file);
// //         const stats = await fs.stat(filePath);
        
// //         if (now - stats.mtime.getTime() > maxAge) {
// //           await fs.unlink(filePath);
// //           cleanedCount++;
// //           console.log(`Removed old audio file: ${file}`);
// //         }
// //       }
      
// //       console.log(`Cleaned ${cleanedCount} old audio files`);
// //     } catch (error) {
// //       console.error('Error cleaning old audio files:', error.message);
// //     }
// //   }

// //   delay(ms) {
// //     return new Promise(resolve => setTimeout(resolve, ms));
// //   }
// // }

// // export default new TTSService();

// import fs from 'fs-extra';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { exec } from 'child_process';
// import { promisify } from 'util';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const execAsync = promisify(exec);

// class TTSService {
//   constructor() {
//     this.audioDir = path.join(process.cwd(), 'audio', 'tts_cache');
//     this.ensureAudioDirectory();
//     this.checkSystemTTS();
//   }

//   ensureAudioDirectory() {
//     if (!fs.existsSync(this.audioDir)) {
//       fs.mkdirSync(this.audioDir, { recursive: true });
//       console.log('✅ Audio directory created:', this.audioDir);
//     }
//   }

//   async checkSystemTTS() {
//     try {
//       // Перевіряємо доступність системного TTS
//       const platform = process.platform;
      
//       if (platform === 'win32') {
//         await execAsync('powershell -Command "Add-Type -AssemblyName System.Speech; $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; $synth.GetInstalledVoices()"');
//         console.log('✅ Windows TTS available');
//       } else if (platform === 'darwin') {
//         await execAsync('say --voice=?');
//         console.log('✅ macOS TTS available');
//       } else if (platform === 'linux') {
//         await execAsync('which espeak || which festival');
//         console.log('✅ Linux TTS available');
//       }
//     } catch (error) {
//       console.log('⚠️ System TTS not available, using fallback');
//     }
//   }

//   async synthesizeSpeech(text, language = 'uk') {
//     try {
//       // Генеруємо унікальний хеш для файлу
//       const filename = `tts_${Buffer.from(text).toString('base64')}.wav`;
//       const filepath = path.join(this.audioDir, filename);

//       // Перевіряємо кеш
//       if (await fs.pathExists(filepath)) {
//         console.log('✅ Using cached audio for:', text.substring(0, 50));
//         return filename;
//       }

//       console.log('🔊 Generating audio for:', text.substring(0, 50));

//       // Використовуємо системний TTS
//       await this.generateWithSystemTTS(text, filepath, language);
      
//       // Перевіряємо, що файл створений
//       if (!await fs.pathExists(filepath)) {
//         throw new Error('Audio file was not created');
//       }

//       console.log('✅ Audio file created:', filename);
//       return filename;

//     } catch (error) {
//       console.error('❌ TTS synthesis error:', error);
//       throw error;
//     }
//   }

//   async generateWithSystemTTS(text, outputPath, language) {
//     const platform = process.platform;
//     const safeText = this.escapeText(text);

//     try {
//       if (platform === 'win32') {
//         // Windows - PowerShell TTS
//         const powerShellCommand = `
//           Add-Type -AssemblyName System.Speech
//           $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
//           $synth.SetOutputToWaveFile("${outputPath}")
//           $synth.Speak("${safeText}")
//         `;
//         await execAsync(`powershell -Command "${powerShellCommand}"`);

//       } else if (platform === 'darwin') {
//         // macOS - say command
//         const voice = language === 'uk' ? 'Victoria' : 'Alex';
//         await execAsync(`say -v "${voice}" -o "${outputPath}" --file-format=WAVE "${safeText}"`);

//       } else if (platform === 'linux') {
//         // Linux - espeak або festival
//         try {
//           // Спочатку пробуємо espeak
//           await execAsync(`espeak -v "${language}" -w "${outputPath}" "${safeText}"`);
//         } catch {
//           // Якщо espeak немає, пробуємо festival
//           await execAsync(`echo "${safeText}" | text2wave -o "${outputPath}"`);
//         }
//       } else {
//         throw new Error(`Unsupported platform: ${platform}`);
//       }
//     } catch (systemError) {
//       console.log('⚠️ System TTS failed, using fallback method');
//       await this.generateWithFallbackTTS(text, outputPath, language);
//     }
//   }

//   async generateWithFallbackTTS(text, outputPath, language) {
//     // Резервний метод - використовуємо Google TTS через curl
//     try {
//       const encodedText = encodeURIComponent(text);
//       const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodedText}`;
      
//       // Завантажуємо аудіо через curl
//       await execAsync(`curl -L -H "User-Agent: Mozilla/5.0" "${ttsUrl}" -o "${outputPath}"`);
      
//     } catch (curlError) {
//       // Останній резерв - створюємо просте аудіо
//       await this.createSimpleAudio(text, outputPath);
//     }
//   }

//   async createSimpleAudio(text, outputPath) {
//     // Створюємо просте аудіо з тоном (заглушка)
//     const audioData = this.generateToneAudio();
//     await fs.writeFile(outputPath, audioData);
//     console.log('⚠️ Created simple tone audio (TTS not available)');
//   }

//   generateToneAudio() {
//     // Генеруємо простий аудіо-тон (1 секунда, 440Hz)
//     const sampleRate = 22050;
//     const frequency = 440;
//     const duration = 1.0;
//     const numSamples = Math.floor(sampleRate * duration);
    
//     const buffer = Buffer.alloc(44 + numSamples * 2); // WAV header + data
    
//     // WAV header
//     buffer.write('RIFF', 0);
//     buffer.writeUInt32LE(36 + numSamples * 2, 4);
//     buffer.write('WAVE', 8);
//     buffer.write('fmt ', 12);
//     buffer.writeUInt32LE(16, 16);
//     buffer.writeUInt16LE(1, 20);
//     buffer.writeUInt16LE(1, 22);
//     buffer.writeUInt32LE(sampleRate, 24);
//     buffer.writeUInt32LE(sampleRate * 2, 28);
//     buffer.writeUInt16LE(2, 32);
//     buffer.writeUInt16LE(16, 34);
//     buffer.write('data', 36);
//     buffer.writeUInt32LE(numSamples * 2, 40);
    
//     // Audio data (sine wave)
//     for (let i = 0; i < numSamples; i++) {
//       const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate);
//       const intSample = Math.floor(sample * 32767);
//       buffer.writeInt16LE(intSample, 44 + i * 2);
//     }
    
//     return buffer;
//   }

//   escapeText(text) {
//     // Екрануємо текст для командного рядка
//     return text.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');
//   }

//   // Масовий синтез
//   async synthesizeAllQuestions(questions) {
//     const audioFiles = [];
    
//     for (const question of questions) {
//       try {
//         const filename = await this.synthesizeSpeech(question.text);
//         audioFiles.push({
//           questionId: question.id || question.text,
//           filename: filename,
//           text: question.text
//         });
        
//         await this.delay(200); // Затримка між запитами
//       } catch (error) {
//         console.error(`❌ Failed to synthesize: ${question.text}`, error.message);
//         audioFiles.push({
//           questionId: question.id || question.text,
//           filename: null,
//           text: question.text,
//           error: error.message
//         });
//       }
//     }
    
//     return audioFiles;
//   }

//   getAudioPath(filename) {
//     return path.join(this.audioDir, filename);
//   }

//   delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }
// }

// export default new TTSService();

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