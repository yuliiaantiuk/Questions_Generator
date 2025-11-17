// // // // // import express from "express";
// // // // // import fs from "fs";
// // // // // import path from "path";
// // // // // import { fileURLToPath } from "url";
// // // // // import { hfGenerateQuestions } from "../services/questionsGenerator.js";
// // // // // import { getSession, updateSession } from "../utils/sessionManager.js";

// // // // // const __filename = fileURLToPath(import.meta.url);
// // // // // const __dirname = path.dirname(__filename);

// // // // // // Папка для збереження результатів
// // // // // const TEMP_STORAGE = path.join(__dirname, "..", "..", "..", "tempQuestions");

// // // // // const router = express.Router();

// // // // // // Перевіряємо, що папка існує
// // // // // if (!fs.existsSync(TEMP_STORAGE)) {
// // // // //   fs.mkdirSync(TEMP_STORAGE, { recursive: true });
// // // // //   console.log("✅ Створено директорію для результатів:", TEMP_STORAGE);
// // // // // }

// // // // // // Глобальний об'єкт для відстеження прогресу
// // // // // const generationProgress = new Map();

// // // // // // POST /api/questions - запуск генерації питань
// // // // // router.post("/", async (req, res) => {
// // // // //   console.log("📥 Отримано запит на генерацію питань:", req.body);
  
// // // // //   try {
// // // // //     const { 
// // // // //       sessionId, 
// // // // //       singleChoice = 0, 
// // // // //       multipleChoice = 0, 
// // // // //       trueFalse = 0, 
// // // // //       shortAnswer = 0, 
// // // // //       difficulty = "medium", 
// // // // //       keywords = [] 
// // // // //     } = req.body;

// // // // //     if (!sessionId) {
// // // // //       return res.status(400).json({ error: "sessionId обов'язковий" });
// // // // //     }

// // // // //     // Перевіряємо сесію
// // // // //     const session = getSession(sessionId);
// // // // //     if (!session) {
// // // // //       return res.status(404).json({ error: "Сесія не знайдена" });
// // // // //     }

// // // // //     // Перевіряємо, що є запитання для генерації
// // // // //     const totalQuestions = parseInt(singleChoice) + parseInt(multipleChoice) + 
// // // // //                           parseInt(trueFalse) + parseInt(shortAnswer);
    
// // // // //     if (totalQuestions === 0) {
// // // // //       return res.status(400).json({ error: "Вкажіть кількість запитань для генерації" });
// // // // //     }

// // // // //     // Ініціалізуємо прогрес
// // // // //     generationProgress.set(sessionId, {
// // // // //       progress: 0,
// // // // //       status: "starting",
// // // // //       questions: [],
// // // // //       isPaused: false,
// // // // //       isCancelled: false,
// // // // //       error: null
// // // // //     });

// // // // //     // Запускаємо генерацію в фоновому режимі
// // // // //     generateQuestionsAsync(sessionId, {
// // // // //       singleChoice: parseInt(singleChoice),
// // // // //       multipleChoice: parseInt(multipleChoice),
// // // // //       trueFalse: parseInt(trueFalse),
// // // // //       shortAnswer: parseInt(shortAnswer),
// // // // //       difficulty,
// // // // //       keywords,
// // // // //       filePath: session.filePath
// // // // //     });

// // // // //     res.json({ 
// // // // //       success: true, 
// // // // //       message: "Генерація питань розпочата",
// // // // //       sessionId,
// // // // //       totalQuestions
// // // // //     });

// // // // //   } catch (err) {
// // // // //     console.error("❌ Помилка запуску генерації:", err);
// // // // //     res.status(500).json({ error: "Помилка запуску генерації: " + err.message });
// // // // //   }
// // // // // });

// // // // // // GET /api/questions/progress/:sessionId - отримання прогресу
// // // // // router.get("/progress/:sessionId", (req, res) => {
// // // // //   try {
// // // // //     const { sessionId } = req.params;
// // // // //     const progress = generationProgress.get(sessionId);
    
// // // // //     if (!progress) {
// // // // //       return res.status(404).json({ error: "Прогрес не знайдено" });
// // // // //     }

// // // // //     res.json({
// // // // //       progress: progress.progress,
// // // // //       status: progress.status,
// // // // //       questions: progress.questions,
// // // // //       isPaused: progress.isPaused,
// // // // //       isCancelled: progress.isCancelled,
// // // // //       error: progress.error
// // // // //     });
// // // // //   } catch (err) {
// // // // //     console.error("❌ Помилка отримання прогресу:", err);
// // // // //     res.status(500).json({ error: "Помилка отримання прогресу" });
// // // // //   }
// // // // // });

// // // // // // PUT /api/questions/pause/:sessionId - пауза генерації
// // // // // router.put("/pause/:sessionId", (req, res) => {
// // // // //   try {
// // // // //     const { sessionId } = req.params;
// // // // //     const progress = generationProgress.get(sessionId);
    
// // // // //     if (!progress) {
// // // // //       return res.status(404).json({ error: "Прогрес не знайдено" });
// // // // //     }

// // // // //     progress.isPaused = true;
// // // // //     progress.status = "paused";
    
// // // // //     res.json({ success: true, status: "paused" });
// // // // //   } catch (err) {
// // // // //     console.error("❌ Помилка паузи генерації:", err);
// // // // //     res.status(500).json({ error: "Помилка паузи" });
// // // // //   }
// // // // // });

// // // // // // PUT /api/questions/resume/:sessionId - продовження генерації
// // // // // router.put("/resume/:sessionId", (req, res) => {
// // // // //   try {
// // // // //     const { sessionId } = req.params;
// // // // //     const progress = generationProgress.get(sessionId);
    
// // // // //     if (!progress) {
// // // // //       return res.status(404).json({ error: "Прогрес не знайдено" });
// // // // //     }

// // // // //     progress.isPaused = false;
// // // // //     progress.status = "generating";
    
// // // // //     res.json({ success: true, status: "generating" });
// // // // //   } catch (err) {
// // // // //     console.error("❌ Помилка продовження генерації:", err);
// // // // //     res.status(500).json({ error: "Помилка продовження" });
// // // // //   }
// // // // // });

// // // // // // DELETE /api/questions/cancel/:sessionId - скасування генерації
// // // // // router.delete("/cancel/:sessionId", (req, res) => {
// // // // //   try {
// // // // //     const { sessionId } = req.params;
// // // // //     const progress = generationProgress.get(sessionId);
    
// // // // //     if (!progress) {
// // // // //       return res.status(404).json({ error: "Прогрес не знайдено" });
// // // // //     }

// // // // //     progress.isCancelled = true;
// // // // //     progress.status = "cancelled";
    
// // // // //     // Очищаємо через 5 секунд
// // // // //     setTimeout(() => {
// // // // //       generationProgress.delete(sessionId);
// // // // //     }, 5000);
    
// // // // //     res.json({ success: true, status: "cancelled" });
// // // // //   } catch (err) {
// // // // //     console.error("❌ Помилка скасування генерації:", err);
// // // // //     res.status(500).json({ error: "Помилка скасування" });
// // // // //   }
// // // // // });

// // // // // // Функція асинхронної генерації
// // // // // async function generateQuestionsAsync(sessionId, config) {
// // // // //   let progress;
  
// // // // //   try {
// // // // //     progress = generationProgress.get(sessionId);
// // // // //     if (!progress) return;

// // // // //     progress.status = "generating";
    
// // // // //     console.log(`🚀 Запуск генерації ${getTotalQuestions(config)} питань для сесії ${sessionId}`);
    
// // // // //     // Генеруємо запитання
// // // // //     const questions = await hfGenerateQuestions(config, (currentProgress) => {
// // // // //       const progressObj = generationProgress.get(sessionId);
// // // // //       if (progressObj && !progressObj.isPaused && !progressObj.isCancelled) {
// // // // //         progressObj.progress = currentProgress;
// // // // //       }
// // // // //     }, () => {
// // // // //       const progressObj = generationProgress.get(sessionId);
// // // // //       return progressObj ? progressObj.isPaused || progressObj.isCancelled : true;
// // // // //     });

// // // // //     if (progress.isCancelled) {
// // // // //       console.log(`❌ Генерація скасована для сесії ${sessionId}`);
// // // // //       return;
// // // // //     }

// // // // //     // Оновлюємо прогрес
// // // // //     progress.progress = 100;
// // // // //     progress.status = "completed";
// // // // //     progress.questions = questions;

// // // // //     // Зберігаємо результати в сесії
// // // // //     updateSession(sessionId, { questions });

// // // // //     // Зберігаємо результати в файл
// // // // //     const resultsPath = path.join(TEMP_STORAGE, `${sessionId}_results.json`);
// // // // //     fs.writeFileSync(resultsPath, JSON.stringify({
// // // // //       questions: questions,
// // // // //       metadata: {
// // // // //         generatedAt: new Date().toISOString(),
// // // // //         totalQuestions: questions.length,
// // // // //         difficulty: config.difficulty,
// // // // //         keywords: config.keywords,
// // // // //         singleChoice: config.singleChoice,
// // // // //         multipleChoice: config.multipleChoice,
// // // // //         trueFalse: config.trueFalse,
// // // // //         shortAnswer: config.shortAnswer
// // // // //       }
// // // // //     }, null, 2));

// // // // //     console.log(`✅ Генерація завершена. Результати збережено: ${resultsPath}`);

// // // // //   } catch (err) {
// // // // //     console.error("❌ Помилка в асинхронній генерації:", err);
    
// // // // //     if (progress) {
// // // // //       progress.status = "error";
// // // // //       progress.error = err.message;
// // // // //     }
// // // // //   }
// // // // // }

// // // // // // Допоміжна функція для підрахунку загальної кількості питань
// // // // // function getTotalQuestions(config) {
// // // // //   return config.singleChoice + config.multipleChoice + config.trueFalse + config.shortAnswer;
// // // // // }

// // // // // export default router;

// // // // import express from "express";
// // // // import fs from "fs";
// // // // import path from "path";
// // // // import { fileURLToPath } from "url";
// // // // import { hfGenerateQuestions } from "../services/questionsGenerator.js";
// // // // import { getSession, updateSession } from "../utils/sessionManager.js";

// // // // const __filename = fileURLToPath(import.meta.url);
// // // // const __dirname = path.dirname(__filename);

// // // // // Папка для збереження результатів
// // // // const TEMP_STORAGE = path.join(__dirname, "..", "..", "..", "tempQuestions");

// // // // const router = express.Router();

// // // // // Перевіряємо, що папка існує
// // // // if (!fs.existsSync(TEMP_STORAGE)) {
// // // //   fs.mkdirSync(TEMP_STORAGE, { recursive: true });
// // // //   console.log("✅ Створено директорію для результатів:", TEMP_STORAGE);
// // // // }

// // // // // Глобальний об'єкт для відстеження прогресу
// // // // const generationProgress = new Map();

// // // // // ТАЙМАУТ ПАУЗИ (30 хвилин)
// // // // const PAUSE_TIMEOUT = 30 * 60 * 1000; // 30 хвилин у мілісекундах

// // // // // POST /api/questions - запуск генерації питань
// // // // router.post("/", async (req, res) => {
// // // //   console.log("📥 Отримано запит на генерацію питань:", req.body);
  
// // // //   try {
// // // //     const { 
// // // //       sessionId, 
// // // //       singleChoice = 0, 
// // // //       multipleChoice = 0, 
// // // //       trueFalse = 0, 
// // // //       shortAnswer = 0, 
// // // //       difficulty = "medium", 
// // // //       keywords = [] 
// // // //     } = req.body;

// // // //     if (!sessionId) {
// // // //       return res.status(400).json({ error: "sessionId обов'язковий" });
// // // //     }

// // // //     // Перевіряємо сесію
// // // //     const session = getSession(sessionId);
// // // //     if (!session) {
// // // //       return res.status(404).json({ error: "Сесія не знайдена" });
// // // //     }

// // // //     // Перевіряємо, що є запитання для генерації
// // // //     const totalQuestions = parseInt(singleChoice) + parseInt(multipleChoice) + 
// // // //                           parseInt(trueFalse) + parseInt(shortAnswer);
    
// // // //     if (totalQuestions === 0) {
// // // //       return res.status(400).json({ error: "Вкажіть кількість запитань для генерації" });
// // // //     }

// // // //     // Ініціалізуємо прогрес з ДОДАТКОВИМИ ПОЛЯМИ
// // // //     generationProgress.set(sessionId, {
// // // //       progress: 0,
// // // //       status: "starting",
// // // //       questions: [],
// // // //       isPaused: false,
// // // //       isCancelled: false,
// // // //       error: null,
// // // //       pauseStartTime: null, // Час початку паузи
// // // //       config: { // Зберігаємо конфігурацію для відновлення
// // // //         singleChoice: parseInt(singleChoice),
// // // //         multipleChoice: parseInt(multipleChoice),
// // // //         trueFalse: parseInt(trueFalse),
// // // //         shortAnswer: parseInt(shortAnswer),
// // // //         difficulty,
// // // //         keywords,
// // // //         filePath: session.filePath
// // // //       },
// // // //       abortController: new AbortController() // Контролер для скасування запитів
// // // //     });

// // // //     // Запускаємо генерацію в фоновому режимі
// // // //     generateQuestionsAsync(sessionId);

// // // //     res.json({ 
// // // //       success: true, 
// // // //       message: "Генерація питань розпочата",
// // // //       sessionId,
// // // //       totalQuestions
// // // //     });

// // // //   } catch (err) {
// // // //     console.error("❌ Помилка запуску генерації:", err);
// // // //     res.status(500).json({ error: "Помилка запуску генерації: " + err.message });
// // // //   }
// // // // });

// // // // // GET /api/questions/progress/:sessionId - отримання прогресу
// // // // router.get("/progress/:sessionId", (req, res) => {
// // // //   try {
// // // //     const { sessionId } = req.params;
// // // //     const progress = generationProgress.get(sessionId);
    
// // // //     if (!progress) {
// // // //       return res.status(404).json({ error: "Прогрес не знайдено" });
// // // //     }

// // // //     // ПЕРЕВІРКА ТАЙМАУТУ ПАУЗИ
// // // //     if (progress.isPaused && progress.pauseStartTime) {
// // // //       const pauseDuration = Date.now() - progress.pauseStartTime;
// // // //       if (pauseDuration > PAUSE_TIMEOUT) {
// // // //         progress.status = "cancelled";
// // // //         progress.error = "Генерацію автоматично скасовано через занадто тривалу паузу (30+ хвилин)";
// // // //         console.log(`⏰ Автоматичне скасування генерації для сесії ${sessionId} через таймаут паузи`);

// // // //         if (progress.abortController) {
// // // //           progress.abortController.abort();
// // // //         }
// // // //       }
// // // //     }

// // // //     res.json({
// // // //       progress: progress.progress,
// // // //       status: progress.status,
// // // //       questions: progress.questions,
// // // //       isPaused: progress.isPaused,
// // // //       isCancelled: progress.isCancelled,
// // // //       error: progress.error
// // // //     });
// // // //   } catch (err) {
// // // //     console.error("❌ Помилка отримання прогресу:", err);
// // // //     res.status(500).json({ error: "Помилка отримання прогресу" });
// // // //   }
// // // // });

// // // // // PUT /api/questions/pause/:sessionId - пауза генерації
// // // // router.put("/pause/:sessionId", (req, res) => {
// // // //   try {
// // // //     const { sessionId } = req.params;
// // // //     const progress = generationProgress.get(sessionId);
    
// // // //     if (!progress) {
// // // //       return res.status(404).json({ error: "Прогрес не знайдено" });
// // // //     }

// // // //     progress.isPaused = true;
// // // //     progress.status = "paused";
// // // //     progress.pauseStartTime = Date.now(); // ЗАПАМ'ЯТОВУЄМО ЧАС ПОЧАТКУ ПАУЗИ
    
// // // //     console.log(`⏸️ Генерацію поставлено на паузу для сесії ${sessionId}`);
    
// // // //     res.json({ success: true, status: "paused" });
// // // //   } catch (err) {
// // // //     console.error("❌ Помилка паузи генерації:", err);
// // // //     res.status(500).json({ error: "Помилка паузи" });
// // // //   }
// // // // });

// // // // // PUT /api/questions/resume/:sessionId - продовження генерації
// // // // router.put("/resume/:sessionId", (req, res) => {
// // // //   try {
// // // //     const { sessionId } = req.params;
// // // //     const progress = generationProgress.get(sessionId);
    
// // // //     if (!progress) {
// // // //       return res.status(404).json({ error: "Прогрес не знайдено" });
// // // //     }

// // // //     progress.isPaused = false;
// // // //     progress.status = "generating";
// // // //     progress.pauseStartTime = null; // СКИДАЄМО ТАЙМЕР ПАУЗИ
    
// // // //     console.log(`▶️ Генерацію відновлено для сесії ${sessionId}`);
    
// // // //     res.json({ success: true, status: "generating" });
// // // //   } catch (err) {
// // // //     console.error("❌ Помилка продовження генерації:", err);
// // // //     res.status(500).json({ error: "Помилка продовження" });
// // // //   }
// // // // });

// // // // // DELETE /api/questions/cancel/:sessionId - скасування генерації
// // // // router.delete("/cancel/:sessionId", (req, res) => {
// // // //   try {
// // // //     const { sessionId } = req.params;
// // // //     const progress = generationProgress.get(sessionId);
    
// // // //     if (!progress) {
// // // //       return res.status(404).json({ error: "Прогрес не знайдено" });
// // // //     }

// // // //     progress.isCancelled = true;
// // // //     progress.status = "cancelled";
// // // //     progress.pauseStartTime = null;
    
// // // //     console.log(`❌ Генерацію скасовано для сесії ${sessionId}`);

// // // //     if (progress.abortController) {
// // // //       progress.abortController.abort();
// // // //       console.log(`🚫 Надіслано сигнал переривання для сесії ${sessionId}`);
// // // //     }
    
// // // //     // Очищаємо через 5 секунд
// // // //     setTimeout(() => {
// // // //       generationProgress.delete(sessionId);
// // // //     }, 5000);
    
// // // //     res.json({ success: true, status: "cancelled" });
// // // //   } catch (err) {
// // // //     console.error("❌ Помилка скасування генерації:", err);
// // // //     res.status(500).json({ error: "Помилка скасування" });
// // // //   }
// // // // });

// // // // // ОНОВЛЕНА ФУНКЦІЯ АСИНХРОННОЇ ГЕНЕРАЦІЇ
// // // // async function generateQuestionsAsync(sessionId) {
// // // //   let progress;
  
// // // //   try {
// // // //     progress = generationProgress.get(sessionId);
// // // //     if (!progress) {
// // // //       console.log(`❌ Прогрес не знайдено для сесії ${sessionId}`);
// // // //       return;
// // // //     }

// // // //     const config = progress.config;
// // // //     progress.status = "generating";
    
// // // //     console.log(`🚀 Запуск генерації ${getTotalQuestions(config)} питань для сесії ${sessionId}`);

// // // //     const checkShouldStop = () => {
// // // //       const currentProgress = generationProgress.get(sessionId);
// // // //       const shouldStop = !currentProgress || currentProgress.isPaused || currentProgress.isCancelled;
      
// // // //       // Перевіряємо сигнал переривання
// // // //       if (progress.abortController && progress.abortController.signal.aborted) {
// // // //         console.log(`🛑 Отримано сигнал переривання для сесії ${sessionId}`);
// // // //         return true;
// // // //       }
      
// // // //       return shouldStop;
// // // //     };
    
// // // //     // Генеруємо запитання з передачею функції перевірки стану
// // // //     const questions = await hfGenerateQuestions(config, (currentProgress) => {
// // // //       const progressObj = generationProgress.get(sessionId);
// // // //       if (progressObj && !progressObj.isPaused && !progressObj.isCancelled) {
// // // //         progressObj.progress = currentProgress;
// // // //       }
// // // //     }, () => {
// // // //       // ФУНКЦІЯ ПЕРЕВІРКИ СТАНУ - повертає true, якщо потрібно зупинитись
// // // //       const progressObj = generationProgress.get(sessionId);
// // // //       return progressObj ? progressObj.isPaused || progressObj.isCancelled : true;
// // // //     });

// // // //     // ПЕРЕВІРКА ЧИ ГЕНЕРАЦІЮ БУЛО СКАСОВАНО АБО ПОСТАВЛЕНО НА ПАУЗУ
// // // //     const currentProgress = generationProgress.get(sessionId);
// // // //     if (!currentProgress || currentProgress.isCancelled) {
// // // //       console.log(`⏹️ Генерацію перервано для сесії ${sessionId}`);
// // // //       return;
// // // //     }

// // // //     if (currentProgress.isPaused) {
// // // //       console.log(`⏸️ Генерація на паузі для сесії ${sessionId}, очікування...`);
// // // //       // Не завершуємо генерацію, просто виходимо - клієнт може продовжити пізніше
// // // //       return;
// // // //     }

// // // //     // Оновлюємо прогрес тільки якщо генерація не на паузі і не скасована
// // // //     progress.progress = 100;
// // // //     progress.status = "completed";
// // // //     progress.questions = questions;

// // // //     // Зберігаємо результати в сесії
// // // //     updateSession(sessionId, { questions });

// // // //     // Зберігаємо результати в файл
// // // //     const resultsPath = path.join(TEMP_STORAGE, `${sessionId}_results.json`);
// // // //     fs.writeFileSync(resultsPath, JSON.stringify({
// // // //       questions: questions,
// // // //       metadata: {
// // // //         generatedAt: new Date().toISOString(),
// // // //         totalQuestions: questions.length,
// // // //         difficulty: config.difficulty,
// // // //         keywords: config.keywords,
// // // //         singleChoice: config.singleChoice,
// // // //         multipleChoice: config.multipleChoice,
// // // //         trueFalse: config.trueFalse,
// // // //         shortAnswer: config.shortAnswer
// // // //       }
// // // //     }, null, 2));

// // // //     console.log(`✅ Генерація завершена. Результати збережено: ${resultsPath}`);

// // // //   } catch (err) {
// // // //     console.error("❌ Помилка в асинхронній генерації:", err);
    
// // // //     if (progress) {
// // // //       progress.status = "error";
// // // //       progress.error = err.message;
// // // //     }
// // // //   }
// // // // }

// // // // // Допоміжна функція для підрахунку загальної кількості питань
// // // // function getTotalQuestions(config) {
// // // //   return config.singleChoice + config.multipleChoice + config.trueFalse + config.shortAnswer;
// // // // }

// // // // export default router;

// // // import express from "express";
// // // import fs from "fs";
// // // import path from "path";
// // // import { fileURLToPath } from "url";
// // // import { hfGenerateQuestions } from "../services/questionsGenerator.js";
// // // import { getSession, updateSession } from "../utils/sessionManager.js";

// // // const __filename = fileURLToPath(import.meta.url);
// // // const __dirname = path.dirname(__filename);

// // // // Папка для збереження результатів
// // // const TEMP_STORAGE = path.join(__dirname, "..", "..", "..", "tempQuestions");

// // // const router = express.Router();

// // // // Перевіряємо, що папка існує
// // // if (!fs.existsSync(TEMP_STORAGE)) {
// // //   fs.mkdirSync(TEMP_STORAGE, { recursive: true });
// // //   console.log("✅ Створено директорію для результатів:", TEMP_STORAGE);
// // // }

// // // // Глобальний об'єкт для відстеження прогресу
// // // const generationProgress = new Map();

// // // // ТАЙМАУТ ПАУЗИ (30 хвилин)
// // // const PAUSE_TIMEOUT = 30 * 60 * 1000; // 30 хвилин у мілісекундах

// // // // POST /api/questions - запуск генерації питань
// // // router.post("/", async (req, res) => {
// // //   console.log("📥 Отримано запит на генерацію питань:", req.body);
  
// // //   try {
// // //     const { 
// // //       sessionId, 
// // //       singleChoice = 0, 
// // //       multipleChoice = 0, 
// // //       trueFalse = 0, 
// // //       shortAnswer = 0, 
// // //       difficulty = "medium", 
// // //       keywords = [] 
// // //     } = req.body;

// // //     if (!sessionId) {
// // //       return res.status(400).json({ error: "sessionId обов'язковий" });
// // //     }

// // //     // Перевіряємо сесію
// // //     const session = getSession(sessionId);
// // //     if (!session) {
// // //       return res.status(404).json({ error: "Сесія не знайдена" });
// // //     }

// // //     // Перевіряємо, що є запитання для генерації
// // //     const totalQuestions = parseInt(singleChoice) + parseInt(multipleChoice) + 
// // //                           parseInt(trueFalse) + parseInt(shortAnswer);
    
// // //     if (totalQuestions === 0) {
// // //       return res.status(400).json({ error: "Вкажіть кількість запитань для генерації" });
// // //     }

// // //     // Ініціалізуємо прогрес з ДОДАТКОВИМИ ПОЛЯМИ
// // //     generationProgress.set(sessionId, {
// // //       progress: 0,
// // //       status: "starting",
// // //       questions: [],
// // //       isPaused: false,
// // //       isCancelled: false,
// // //       error: null,
// // //       pauseStartTime: null,
// // //       config: {
// // //         singleChoice: parseInt(singleChoice),
// // //         multipleChoice: parseInt(multipleChoice),
// // //         trueFalse: parseInt(trueFalse),
// // //         shortAnswer: parseInt(shortAnswer),
// // //         difficulty,
// // //         keywords,
// // //         filePath: session.filePath
// // //       },
// // //       // ДОДАЄМО ПОСИЛАННЯ НА АКТИВНУ ГЕНЕРАЦІЮ
// // //       abortController: new AbortController()
// // //     });

// // //     // Запускаємо генерацію в фоновому режимі
// // //     generateQuestionsAsync(sessionId);

// // //     res.json({ 
// // //       success: true, 
// // //       message: "Генерація питань розпочата",
// // //       sessionId,
// // //       totalQuestions
// // //     });

// // //   } catch (err) {
// // //     console.error("❌ Помилка запуску генерації:", err);
// // //     res.status(500).json({ error: "Помилка запуску генерації: " + err.message });
// // //   }
// // // });

// // // // GET /api/questions/progress/:sessionId - отримання прогресу
// // // router.get("/progress/:sessionId", (req, res) => {
// // //   try {
// // //     const { sessionId } = req.params;
// // //     const progress = generationProgress.get(sessionId);
    
// // //     if (!progress) {
// // //       return res.status(404).json({ error: "Прогрес не знайдено" });
// // //     }

// // //     // ПЕРЕВІРКА ТАЙМАУТУ ПАУЗИ
// // //     if (progress.isPaused && progress.pauseStartTime) {
// // //       const pauseDuration = Date.now() - progress.pauseStartTime;
// // //       if (pauseDuration > PAUSE_TIMEOUT) {
// // //         progress.status = "cancelled";
// // //         progress.error = "Генерацію автоматично скасовано через занадто тривалу паузу (30+ хвилин)";
// // //         console.log(`⏰ Автоматичне скасування генерації для сесії ${sessionId} через таймаут паузи`);
        
// // //         // СИГНАЛІЗУЄМО ПРО ПЕРЕРИВАННЯ
// // //         if (progress.abortController) {
// // //           progress.abortController.abort();
// // //         }
// // //       }
// // //     }

// // //     res.json({
// // //       progress: progress.progress,
// // //       status: progress.status,
// // //       questions: progress.questions,
// // //       isPaused: progress.isPaused,
// // //       isCancelled: progress.isCancelled,
// // //       error: progress.error
// // //     });
// // //   } catch (err) {
// // //     console.error("❌ Помилка отримання прогресу:", err);
// // //     res.status(500).json({ error: "Помилка отримання прогресу" });
// // //   }
// // // });

// // // // PUT /api/questions/pause/:sessionId - пауза генерації
// // // router.put("/pause/:sessionId", (req, res) => {
// // //   try {
// // //     const { sessionId } = req.params;
// // //     const progress = generationProgress.get(sessionId);
    
// // //     if (!progress) {
// // //       return res.status(404).json({ error: "Прогрес не знайдено" });
// // //     }

// // //     progress.isPaused = true;
// // //     progress.status = "paused";
// // //     progress.pauseStartTime = Date.now();
    
// // //     console.log(`⏸️ Генерацію поставлено на паузу для сесії ${sessionId}`);
    
// // //     res.json({ success: true, status: "paused" });
// // //   } catch (err) {
// // //     console.error("❌ Помилка паузи генерації:", err);
// // //     res.status(500).json({ error: "Помилка паузи" });
// // //   }
// // // });

// // // // PUT /api/questions/resume/:sessionId - продовження генерації
// // // router.put("/resume/:sessionId", (req, res) => {
// // //   try {
// // //     const { sessionId } = req.params;
// // //     const progress = generationProgress.get(sessionId);
    
// // //     if (!progress) {
// // //       return res.status(404).json({ error: "Прогрес не знайдено" });
// // //     }

// // //     progress.isPaused = false;
// // //     progress.status = "generating";
// // //     progress.pauseStartTime = null;
    
// // //     console.log(`▶️ Генерацію відновлено для сесії ${sessionId}`);
    
// // //     res.json({ success: true, status: "generating" });
// // //   } catch (err) {
// // //     console.error("❌ Помилка продовження генерації:", err);
// // //     res.status(500).json({ error: "Помилка продовження" });
// // //   }
// // // });

// // // // DELETE /api/questions/cancel/:sessionId - скасування генерації
// // // router.delete("/cancel/:sessionId", (req, res) => {
// // //   try {
// // //     const { sessionId } = req.params;
// // //     const progress = generationProgress.get(sessionId);
    
// // //     if (!progress) {
// // //       return res.status(404).json({ error: "Прогрес не знайдено" });
// // //     }

// // //     progress.isCancelled = true;
// // //     progress.status = "cancelled";
// // //     progress.pauseStartTime = null;
    
// // //     console.log(`❌ Генерацію скасовано для сесії ${sessionId}`);
    
// // //     // СИГНАЛІЗУЄМО ПРО ПЕРЕРИВАННЯ ГЕНЕРАЦІЇ
// // //     if (progress.abortController) {
// // //       progress.abortController.abort();
// // //       console.log(`🚫 Надіслано сигнал переривання для сесії ${sessionId}`);
// // //     }
    
// // //     // Очищаємо через 5 секунд
// // //     setTimeout(() => {
// // //       generationProgress.delete(sessionId);
// // //       console.log(`🧹 Очищено прогрес для сесії ${sessionId}`);
// // //     }, 5000);
    
// // //     res.json({ success: true, status: "cancelled" });
// // //   } catch (err) {
// // //     console.error("❌ Помилка скасування генерації:", err);
// // //     res.status(500).json({ error: "Помилка скасування" });
// // //   }
// // // });

// // // // ОНОВЛЕНА ФУНКЦІЯ АСИНХРОННОЇ ГЕНЕРАЦІЇ
// // // async function generateQuestionsAsync(sessionId) {
// // //   let progress;
  
// // //   try {
// // //     progress = generationProgress.get(sessionId);
// // //     if (!progress) {
// // //       console.log(`❌ Прогрес не знайдено для сесії ${sessionId}`);
// // //       return;
// // //     }

// // //     const config = progress.config;
// // //     progress.status = "generating";
    
// // //     console.log(`🚀 Запуск генерації ${getTotalQuestions(config)} питань для сесії ${sessionId}`);
    
// // //     // ДОДАЄМО ПЕРЕВІРКУ ПЕРЕРИВАННЯ
// // //     const checkShouldStop = () => {
// // //       const currentProgress = generationProgress.get(sessionId);
// // //       const shouldStop = !currentProgress || currentProgress.isPaused || currentProgress.isCancelled;
      
// // //       // Перевіряємо сигнал переривання
// // //       if (progress.abortController && progress.abortController.signal.aborted) {
// // //         console.log(`🛑 Отримано сигнал переривання для сесії ${sessionId}`);
// // //         return true;
// // //       }
      
// // //       return shouldStop;
// // //     };

// // //     // Генеруємо запитання з передачею функції перевірки стану
// // //     const questions = await hfGenerateQuestions(config, (currentProgress) => {
// // //       const progressObj = generationProgress.get(sessionId);
// // //       if (progressObj && !progressObj.isPaused && !progressObj.isCancelled) {
// // //         progressObj.progress = currentProgress;
// // //       }
// // //     }, checkShouldStop);

// // //     // ПЕРЕВІРКА ЧИ ГЕНЕРАЦІЮ БУЛО СКАСОВАНО АБО ПОСТАВЛЕНО НА ПАУЗУ
// // //     const currentProgress = generationProgress.get(sessionId);
// // //     if (!currentProgress) {
// // //       console.log(`📭 Сесія ${sessionId} більше не існує`);
// // //       return;
// // //     }

// // //     if (currentProgress.isCancelled) {
// // //       console.log(`⏹️ Генерацію скасовано для сесії ${sessionId}`);
// // //       return;
// // //     }

// // //     if (currentProgress.isPaused) {
// // //       console.log(`⏸️ Генерація на паузі для сесії ${sessionId}`);
// // //       return;
// // //     }

// // //     // Оновлюємо прогрес тільки якщо генерація не на паузі і не скасована
// // //     progress.progress = 100;
// // //     progress.status = "completed";
// // //     progress.questions = questions;

// // //     // Зберігаємо результати в сесії
// // //     updateSession(sessionId, { questions });

// // //     // Зберігаємо результати в файл
// // //     const resultsPath = path.join(TEMP_STORAGE, `${sessionId}_results.json`);
// // //     fs.writeFileSync(resultsPath, JSON.stringify({
// // //       questions: questions,
// // //       metadata: {
// // //         generatedAt: new Date().toISOString(),
// // //         totalQuestions: questions.length,
// // //         difficulty: config.difficulty,
// // //         keywords: config.keywords,
// // //         singleChoice: config.singleChoice,
// // //         multipleChoice: config.multipleChoice,
// // //         trueFalse: config.trueFalse,
// // //         shortAnswer: config.shortAnswer
// // //       }
// // //     }, null, 2));

// // //     console.log(`✅ Генерація завершена. Результати збережено: ${resultsPath}`);

// // //   } catch (err) {
// // //     console.error("❌ Помилка в асинхронній генерації:", err);
    
// // //     if (progress) {
// // //       progress.status = "error";
// // //       progress.error = err.message;
// // //     }
// // //   }
// // // }

// // // // Допоміжна функція для підрахунку загальної кількості питань
// // // function getTotalQuestions(config) {
// // //   return config.singleChoice + config.multipleChoice + config.trueFalse + config.shortAnswer;
// // // }

// // // export default router;

// // import express from "express";
// // import fs from "fs";
// // import path from "path";
// // import { fileURLToPath } from "url";
// // import { hfGenerateQuestions } from "../services/questionsGenerator.js";
// // import { getSession, updateSession } from "../utils/sessionManager.js";

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // // Папка для збереження результатів
// // const TEMP_STORAGE = path.join(__dirname, "..", "..", "..", "tempQuestions");

// // const router = express.Router();

// // // Перевіряємо, що папка існує
// // if (!fs.existsSync(TEMP_STORAGE)) {
// //   fs.mkdirSync(TEMP_STORAGE, { recursive: true });
// //   console.log("✅ Створено директорію для результатів:", TEMP_STORAGE);
// // }

// // // Глобальний об'єкт для відстеження прогресу
// // const generationProgress = new Map();

// // // POST /api/questions - запуск генерації питань
// // router.post("/", async (req, res) => {
// //   console.log("📥 Отримано запит на генерацію питань:", req.body);
  
// //   try {
// //     const { 
// //       sessionId, 
// //       singleChoice = 0, 
// //       multipleChoice = 0, 
// //       trueFalse = 0, 
// //       shortAnswer = 0, 
// //       difficulty = "medium", 
// //       keywords = [] 
// //     } = req.body;

// //     if (!sessionId) {
// //       return res.status(400).json({ error: "sessionId обов'язковий" });
// //     }

// //     // Перевіряємо сесію
// //     const session = getSession(sessionId);
// //     if (!session) {
// //       return res.status(404).json({ error: "Сесія не знайдена" });
// //     }

// //     // Перевіряємо, що є запитання для генерації
// //     const totalQuestions = parseInt(singleChoice) + parseInt(multipleChoice) + 
// //                           parseInt(trueFalse) + parseInt(shortAnswer);
    
// //     if (totalQuestions === 0) {
// //       return res.status(400).json({ error: "Вкажіть кількість запитань для генерації" });
// //     }

// //     // Ініціалізуємо прогрес
// //     generationProgress.set(sessionId, {
// //       progress: 0,
// //       status: "starting",
// //       questions: [],
// //       isPaused: false,
// //       isCancelled: false,
// //       error: null,
// //       config: {
// //         singleChoice: parseInt(singleChoice),
// //         multipleChoice: parseInt(multipleChoice),
// //         trueFalse: parseInt(trueFalse),
// //         shortAnswer: parseInt(shortAnswer),
// //         difficulty,
// //         keywords,
// //         filePath: session.filePath
// //       }
// //     });

// //     // Запускаємо генерацію в фоновому режимі
// //     generateQuestionsAsync(sessionId);

// //     res.json({ 
// //       success: true, 
// //       message: "Генерація питань розпочата",
// //       sessionId,
// //       totalQuestions
// //     });

// //   } catch (err) {
// //     console.error("❌ Помилка запуску генерації:", err);
// //     res.status(500).json({ error: "Помилка запуску генерації: " + err.message });
// //   }
// // });

// // // GET /api/questions/progress/:sessionId - отримання прогресу
// // router.get("/progress/:sessionId", (req, res) => {
// //   try {
// //     const { sessionId } = req.params;
// //     const progress = generationProgress.get(sessionId);
    
// //     if (!progress) {
// //       return res.status(404).json({ error: "Прогрес не знайдено" });
// //     }

// //     res.json({
// //       progress: progress.progress,
// //       status: progress.status,
// //       questions: progress.questions,
// //       isPaused: progress.isPaused,
// //       isCancelled: progress.isCancelled,
// //       error: progress.error
// //     });
// //   } catch (err) {
// //     console.error("❌ Помилка отримання прогресу:", err);
// //     res.status(500).json({ error: "Помилка отримання прогресу" });
// //   }
// // });

// // // PUT /api/questions/pause/:sessionId - пауза генерації
// // router.put("/pause/:sessionId", (req, res) => {
// //   try {
// //     const { sessionId } = req.params;
// //     const progress = generationProgress.get(sessionId);
    
// //     if (!progress) {
// //       return res.status(404).json({ error: "Прогрес не знайдено" });
// //     }

// //     progress.isPaused = true;
// //     progress.status = "paused";
    
// //     console.log(`⏸️ Генерацію поставлено на паузу для сесії ${sessionId}`);
    
// //     res.json({ success: true, status: "paused" });
// //   } catch (err) {
// //     console.error("❌ Помилка паузи генерації:", err);
// //     res.status(500).json({ error: "Помилка паузи" });
// //   }
// // });

// // // PUT /api/questions/resume/:sessionId - продовження генерації
// // router.put("/resume/:sessionId", (req, res) => {
// //   try {
// //     const { sessionId } = req.params;
// //     const progress = generationProgress.get(sessionId);
    
// //     if (!progress) {
// //       return res.status(404).json({ error: "Прогрес не знайдено" });
// //     }

// //     progress.isPaused = false;
// //     progress.status = "generating";
    
// //     console.log(`▶️ Генерацію відновлено для сесії ${sessionId}`);
    
// //     res.json({ success: true, status: "generating" });
// //   } catch (err) {
// //     console.error("❌ Помилка продовження генерації:", err);
// //     res.status(500).json({ error: "Помилка продовження" });
// //   }
// // });

// // // DELETE /api/questions/cancel/:sessionId - скасування генерації
// // router.delete("/cancel/:sessionId", (req, res) => {
// //   try {
// //     const { sessionId } = req.params;
// //     const progress = generationProgress.get(sessionId);
    
// //     if (!progress) {
// //       return res.status(404).json({ error: "Прогрес не знайдено" });
// //     }

// //     progress.isCancelled = true;
// //     progress.status = "cancelled";
    
// //     console.log(`❌ Генерацію скасовано для сесії ${sessionId}`);
    
// //     // Очищаємо негайно
// //     generationProgress.delete(sessionId);
// //     console.log(`🧹 Очищено прогрес для сесії ${sessionId}`);
    
// //     res.json({ success: true, status: "cancelled" });
// //   } catch (err) {
// //     console.error("❌ Помилка скасування генерації:", err);
// //     res.status(500).json({ error: "Помилка скасування" });
// //   }
// // });

// // // Спрощена функція асинхронної генерації
// // async function generateQuestionsAsync(sessionId) {
// //   let progress;
  
// //   try {
// //     progress = generationProgress.get(sessionId);
// //     if (!progress) {
// //       console.log(`❌ Прогрес не знайдено для сесії ${sessionId}`);
// //       return;
// //     }

// //     const config = progress.config;
// //     progress.status = "generating";
    
// //     console.log(`🚀 Запуск генерації ${getTotalQuestions(config)} питань для сесії ${sessionId}`);
    
// //     // Проста функція перевірки стану
// //     const checkShouldStop = () => {
// //       const currentProgress = generationProgress.get(sessionId);
// //       return !currentProgress || currentProgress.isPaused || currentProgress.isCancelled;
// //     };

// //     // Генеруємо запитання
// //     const questions = await hfGenerateQuestions(config, (currentProgress) => {
// //       const progressObj = generationProgress.get(sessionId);
// //       if (progressObj && !progressObj.isPaused && !progressObj.isCancelled) {
// //         progressObj.progress = currentProgress;
// //       }
// //     }, checkShouldStop);

// //     // Фінальна перевірка стану
// //     const currentProgress = generationProgress.get(sessionId);
// //     if (!currentProgress || currentProgress.isCancelled) {
// //       console.log(`⏹️ Генерацію перервано для сесії ${sessionId}`);
// //       return;
// //     }

// //     if (currentProgress.isPaused) {
// //       console.log(`⏸️ Генерація на паузі для сесії ${sessionId}`);
// //       return;
// //     }

// //     // Завершення успішної генерації
// //     progress.progress = 100;
// //     progress.status = "completed";
// //     progress.questions = questions;

// //     // Зберігаємо результати
// //     updateSession(sessionId, { questions });

// //     const resultsPath = path.join(TEMP_STORAGE, `${sessionId}_results.json`);
// //     fs.writeFileSync(resultsPath, JSON.stringify({
// //       questions: questions,
// //       metadata: {
// //         generatedAt: new Date().toISOString(),
// //         totalQuestions: questions.length,
// //         difficulty: config.difficulty,
// //         keywords: config.keywords,
// //         singleChoice: config.singleChoice,
// //         multipleChoice: config.multipleChoice,
// //         trueFalse: config.trueFalse,
// //         shortAnswer: config.shortAnswer
// //       }
// //     }, null, 2));

// //     console.log(`✅ Генерація завершена. Результати збережено: ${resultsPath}`);

// //   } catch (err) {
// //     console.error("❌ Помилка в асинхронній генерації:", err);
    
// //     if (progress) {
// //       progress.status = "error";
// //       progress.error = err.message;
// //     }
// //   }
// // }

// // // Допоміжна функція
// // function getTotalQuestions(config) {
// //   return config.singleChoice + config.multipleChoice + config.trueFalse + config.shortAnswer;
// // }

// // export default router;

// import express from "express";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import { hfGenerateQuestions } from "../services/questionsGenerator.js";
// import { getSession, updateSession } from "../utils/sessionManager.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const TEMP_STORAGE = path.join(__dirname, "..", "..", "..", "tempQuestions");
// const router = express.Router();

// if (!fs.existsSync(TEMP_STORAGE)) {
//   fs.mkdirSync(TEMP_STORAGE, { recursive: true });
// }

// const generationProgress = new Map();

// // POST /api/questions - запуск генерації питань
// router.post("/", async (req, res) => {
//   console.log("📥 Отримано запит на генерацію питань:", req.body);
  
//   try {
//     const { sessionId, singleChoice = 0, multipleChoice = 0, trueFalse = 0, shortAnswer = 0, difficulty = "medium", keywords = [] } = req.body;

//     if (!sessionId) return res.status(400).json({ error: "sessionId обов'язковий" });

//     const session = getSession(sessionId);
//     if (!session) return res.status(404).json({ error: "Сесія не знайдена" });

//     const totalQuestions = parseInt(singleChoice) + parseInt(multipleChoice) + parseInt(trueFalse) + parseInt(shortAnswer);
//     if (totalQuestions === 0) return res.status(400).json({ error: "Вкажіть кількість запитань" });

//     // Ініціалізуємо прогрес
//     generationProgress.set(sessionId, {
//       progress: 0,
//       status: "starting",
//       questions: [],
//       isPaused: false,
//       isCancelled: false,
//       error: null,
//       config: {
//         singleChoice: parseInt(singleChoice),
//         multipleChoice: parseInt(multipleChoice),
//         trueFalse: parseInt(trueFalse),
//         shortAnswer: parseInt(shortAnswer),
//         difficulty,
//         keywords,
//         filePath: session.filePath
//       }
//     });

//     // Запускаємо генерацію
//     generateQuestionsAsync(sessionId);

//     res.json({ success: true, message: "Генерація питань розпочата", sessionId, totalQuestions });

//   } catch (err) {
//     console.error("❌ Помилка запуску генерації:", err);
//     res.status(500).json({ error: "Помилка запуску генерації: " + err.message });
//   }
// });

// // GET /api/questions/progress/:sessionId
// router.get("/progress/:sessionId", (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const progress = generationProgress.get(sessionId);
//     if (!progress) return res.status(404).json({ error: "Прогрес не знайдено" });

//     res.json({
//       progress: progress.progress,
//       status: progress.status,
//       questions: progress.questions,
//       isPaused: progress.isPaused,
//       isCancelled: progress.isCancelled,
//       error: progress.error
//     });
//   } catch (err) {
//     console.error("❌ Помилка отримання прогресу:", err);
//     res.status(500).json({ error: "Помилка отримання прогресу" });
//   }
// });

// // PUT /api/questions/pause/:sessionId
// router.put("/pause/:sessionId", (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const progress = generationProgress.get(sessionId);
//     if (!progress) return res.status(404).json({ error: "Прогрес не знайдено" });

//     progress.isPaused = true;
//     progress.status = "paused";
//     console.log(`⏸️ Генерацію поставлено на паузу для сесії ${sessionId}`);
//     res.json({ success: true, status: "paused" });
//   } catch (err) {
//     console.error("❌ Помилка паузи:", err);
//     res.status(500).json({ error: "Помилка паузи" });
//   }
// });

// // PUT /api/questions/resume/:sessionId
// router.put("/resume/:sessionId", (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const progress = generationProgress.get(sessionId);
//     if (!progress) return res.status(404).json({ error: "Прогрес не знайдено" });

//     progress.isPaused = false;
//     progress.status = "generating";
//     console.log(`▶️ Генерацію відновлено для сесії ${sessionId}`);
//     res.json({ success: true, status: "generating" });
//   } catch (err) {
//     console.error("❌ Помилка продовження:", err);
//     res.status(500).json({ error: "Помилка продовження" });
//   }
// });

// // DELETE /api/questions/cancel/:sessionId
// router.delete("/cancel/:sessionId", (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const progress = generationProgress.get(sessionId);
//     if (!progress) return res.status(404).json({ error: "Прогрес не знайдено" });

//     progress.isCancelled = true;
//     progress.status = "cancelled";
//     console.log(`❌ Генерацію скасовано для сесії ${sessionId}`);
    
//     // НЕГАЙНО видаляємо з мапи
//     generationProgress.delete(sessionId);
//     console.log(`🧹 Очищено прогрес для сесії ${sessionId}`);
    
//     res.json({ success: true, status: "cancelled" });
//   } catch (err) {
//     console.error("❌ Помилка скасування:", err);
//     res.status(500).json({ error: "Помилка скасування" });
//   }
// });

// // ФУНКЦІЯ ГЕНЕРАЦІЇ
// async function generateQuestionsAsync(sessionId) {
//   let progress = generationProgress.get(sessionId);
//   if (!progress) return;

//   const config = progress.config;
//   progress.status = "generating";
  
//   console.log(`🚀 Запуск генерації ${getTotalQuestions(config)} питань для сесії ${sessionId}`);

//   try {
//     const questions = await hfGenerateQuestions(config, 
//       // Функція оновлення прогресу
//       (currentProgress) => {
//         const current = generationProgress.get(sessionId);
//         if (current && !current.isPaused && !current.isCancelled) {
//           current.progress = currentProgress;
//         }
//       },
//       // Функція перевірки стану - ПРОСТА
//       () => {
//         const current = generationProgress.get(sessionId);
//         return !current || current.isPaused || current.isCancelled;
//       }
//     );

//     // Перевіряємо чи не скасовано генерацію
//     const finalProgress = generationProgress.get(sessionId);
//     if (!finalProgress || finalProgress.isCancelled) {
//       console.log(`⏹️ Генерацію скасовано для сесії ${sessionId}`);
//       return;
//     }

//     // Завершення успішної генерації
//     progress.progress = 100;
//     progress.status = "completed";
//     progress.questions = questions;

//     updateSession(sessionId, { questions });

//     const resultsPath = path.join(TEMP_STORAGE, `${sessionId}_results.json`);
//     fs.writeFileSync(resultsPath, JSON.stringify({
//       questions: questions,
//       metadata: {
//         generatedAt: new Date().toISOString(),
//         totalQuestions: questions.length,
//         difficulty: config.difficulty,
//         keywords: config.keywords,
//         singleChoice: config.singleChoice,
//         multipleChoice: config.multipleChoice,
//         trueFalse: config.trueFalse,
//         shortAnswer: config.shortAnswer
//       }
//     }, null, 2));

//     console.log(`✅ Генерація завершена. Результати збережено: ${resultsPath}`);

//   } catch (err) {
//     console.error("❌ Помилка в генерації:", err);
//     if (progress) {
//       progress.status = "error";
//       progress.error = err.message;
//     }
//   }
// }

// function getTotalQuestions(config) {
//   return config.singleChoice + config.multipleChoice + config.trueFalse + config.shortAnswer;
// }

// export default router;

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { hfGenerateQuestions } from "../services/questionsGenerator.js";
import { getSession, updateSession } from "../utils/sessionManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_STORAGE = path.join(__dirname, "..", "..", "..", "tempQuestions");
const router = express.Router();

if (!fs.existsSync(TEMP_STORAGE)) {
  fs.mkdirSync(TEMP_STORAGE, { recursive: true });
}

const generationProgress = new Map();

// 🕒 ТАЙМАУТ ПАУЗИ - 30 ХВИЛИН
const PAUSE_TIMEOUT = 30 * 60 * 1000;

// 📤 POST /api/questions - запуск генерації питань
router.post("/", async (req, res) => {
  console.log("📥 Отримано запит на генерацію питань:", req.body);
  
  try {
    const { sessionId, singleChoice = 0, multipleChoice = 0, trueFalse = 0, shortAnswer = 0, difficulty = "medium", keywords = [] } = req.body;

    if (!sessionId) return res.status(400).json({ error: "sessionId обов'язковий" });

    const session = getSession(sessionId);
    if (!session) return res.status(404).json({ error: "Сесія не знайдена" });

    const totalQuestions = parseInt(singleChoice) + parseInt(multipleChoice) + parseInt(trueFalse) + parseInt(shortAnswer);
    if (totalQuestions === 0) return res.status(400).json({ error: "Вкажіть кількість запитань" });

    // 🎯 ІНІЦІАЛІЗАЦІЯ ПРОГРЕСУ З ЧАСОМ ПАУЗИ
    generationProgress.set(sessionId, {
      progress: 0,
      status: "starting",
      questions: [],
      isPaused: false,
      isCancelled: false,
      error: null,
      pauseStartTime: null, // Час початку паузи
      config: {
        singleChoice: parseInt(singleChoice),
        multipleChoice: parseInt(multipleChoice),
        trueFalse: parseInt(trueFalse),
        shortAnswer: parseInt(shortAnswer),
        difficulty,
        keywords,
        filePath: session.filePath
      }
    });

    generateQuestionsAsync(sessionId);

    res.json({ success: true, message: "Генерація питань розпочата", sessionId, totalQuestions });

  } catch (err) {
    console.error("❌ Помилка запуску генерації:", err);
    res.status(500).json({ error: "Помилка запуску генерації: " + err.message });
  }
});

// 📊 GET /api/questions/progress/:sessionId
router.get("/progress/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const progress = generationProgress.get(sessionId);
    if (!progress) return res.status(404).json({ error: "Прогрес не знайдено" });

    // 🔄 ПЕРЕВІРКА ТАЙМАУТУ ПАУЗИ
    if (progress.isPaused && progress.pauseStartTime) {
      const pauseDuration = Date.now() - progress.pauseStartTime;
      if (pauseDuration > PAUSE_TIMEOUT) {
        progress.status = "cancelled";
        progress.error = "Генерацію автоматично скасовано через занадто тривалу паузу (30+ хвилин)";
        console.log(`⏰ Автоматичне скасування генерації для сесії ${sessionId} через таймаут паузи`);
      }
    }

    res.json({
      progress: progress.progress,
      status: progress.status,
      questions: progress.questions,
      isPaused: progress.isPaused,
      isCancelled: progress.isCancelled,
      error: progress.error
    });
  } catch (err) {
    console.error("❌ Помилка отримання прогресу:", err);
    res.status(500).json({ error: "Помилка отримання прогресу" });
  }
});

// ⏸️ PUT /api/questions/pause/:sessionId
router.put("/pause/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const progress = generationProgress.get(sessionId);
    if (!progress) return res.status(404).json({ error: "Прогрес не знайдено" });

    progress.isPaused = true;
    progress.status = "paused";
    progress.pauseStartTime = Date.now(); // 🕒 ЗАПАМ'ЯТОВУЄМО ЧАС ПОЧАТКУ ПАУЗИ
    
    console.log(`⏸️ Генерацію поставлено на паузу для сесії ${sessionId}`);
    res.json({ success: true, status: "paused" });
  } catch (err) {
    console.error("❌ Помилка паузи:", err);
    res.status(500).json({ error: "Помилка паузи" });
  }
});

// ▶️ PUT /api/questions/resume/:sessionId
router.put("/resume/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const progress = generationProgress.get(sessionId);
    if (!progress) return res.status(404).json({ error: "Прогрес не знайдено" });

    progress.isPaused = false;
    progress.status = "generating";
    progress.pauseStartTime = null; // 🕒 СКИДАЄМО ТАЙМЕР ПАУЗИ
    
    console.log(`▶️ Генерацію відновлено для сесії ${sessionId}`);
    res.json({ success: true, status: "generating" });
  } catch (err) {
    console.error("❌ Помилка продовження:", err);
    res.status(500).json({ error: "Помилка продовження" });
  }
});

// ❌ DELETE /api/questions/cancel/:sessionId
router.delete("/cancel/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const progress = generationProgress.get(sessionId);
    if (!progress) return res.status(404).json({ error: "Прогрес не знайдено" });

    progress.isCancelled = true;
    progress.status = "cancelled";
    progress.pauseStartTime = null;
    
    console.log(`❌ Генерацію скасовано для сесії ${sessionId}`);
    
    // 🧹 НЕГАЙНО ВИДАЛЯЄМО З МАПИ
    generationProgress.delete(sessionId);
    console.log(`🧹 Очищено прогрес для сесії ${sessionId}`);
    
    res.json({ success: true, status: "cancelled" });
  } catch (err) {
    console.error("❌ Помилка скасування:", err);
    res.status(500).json({ error: "Помилка скасування" });
  }
});

// 🎯 ОНОВЛЕНА ФУНКЦІЯ ГЕНЕРАЦІЇ
async function generateQuestionsAsync(sessionId) {
  let progress = generationProgress.get(sessionId);
  if (!progress) return;

  const config = progress.config;
  progress.status = "generating";
  
  console.log(`🚀 Запуск генерації ${getTotalQuestions(config)} питань для сесії ${sessionId}`);

  try {
    const questions = await hfGenerateQuestions(config, 
      // 📊 ФУНКЦІЯ ОНОВЛЕННЯ ПРОГРЕСУ
      (currentProgress) => {
        const current = generationProgress.get(sessionId);
        if (current && !current.isPaused && !current.isCancelled) {
          current.progress = currentProgress;
        }
      },
      // 🔄 ФУНКЦІЯ ПЕРЕВІРКИ СТАНУ
      () => {
        const current = generationProgress.get(sessionId);
        return !current || current.isPaused || current.isCancelled;
      }
    );

    // 🔄 ФІНАЛЬНА ПЕРЕВІРКА СТАНУ
    const finalProgress = generationProgress.get(sessionId);
    if (!finalProgress || finalProgress.isCancelled) {
      console.log(`⏹️ Генерацію скасовано для сесії ${sessionId}`);
      return;
    }

    // ✅ УСПІШНЕ ЗАВЕРШЕННЯ
    progress.progress = 100;
    progress.status = "completed";
    progress.questions = questions;

    updateSession(sessionId, { questions });

    const resultsPath = path.join(TEMP_STORAGE, `${sessionId}_results.json`);
    fs.writeFileSync(resultsPath, JSON.stringify({
      questions: questions,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalQuestions: questions.length,
        difficulty: config.difficulty,
        keywords: config.keywords,
        singleChoice: config.singleChoice,
        multipleChoice: config.multipleChoice,
        trueFalse: config.trueFalse,
        shortAnswer: config.shortAnswer
      }
    }, null, 2));

    console.log(`✅ Генерація завершена. Результати збережено: ${resultsPath}`);

  } catch (err) {
    console.error("❌ Помилка в генерації:", err);
    if (progress) {
      progress.status = "error";
      progress.error = err.message;
    }
  }
}

function getTotalQuestions(config) {
  return config.singleChoice + config.multipleChoice + config.trueFalse + config.shortAnswer;
}

export default router;