// // const express = require('express');
// // const router = express.Router();

// // // POST /api/generate - генерація питань
// // router.post('/', async (req, res) => {
// //     try {
// //         const { sessionId, settings } = req.body;
        
// //         if (!sessionId) {
// //             return res.status(400).json({
// //                 error: 'sessionId обов\'язковий'
// //             });
// //         }

// //         // Симуляція процесу генерації
// //         const generationId = require('crypto').randomUUID();
        
// //         res.status(202).json({
// //             success: true,
// //             message: 'Генерація питань розпочата',
// //             generationId: generationId,
// //             sessionId: sessionId,
// //             status: 'in_progress',
// //             estimatedTime: '2-3 хвилини'
// //         });

// //     } catch (error) {
// //         console.error('Generation error:', error);
// //         res.status(500).json({
// //             error: 'Помилка при генерації питань',
// //             details: error.message
// //         });
// //     }
// // });

// // module.exports = router;


// // import express from "express";
// // import path from "path";
// // import fs from "fs-extra";
// // import { extractTextFromPath } from "../services/textExtractor.js";
// // import { extractKeywords } from "../services/nlpService.js";
// // import { hfGenerateText, hfTextToSpeech } from "../services/hfService.js";
// // import dotenv from "dotenv";
// // dotenv.config();

// // const router = express.Router();
// // const TEMP_DIR = process.env.TEMP_DIR || path.resolve(process.cwd(), "temp");
// // const HF_MODEL = process.env.HF_TEXT_MODEL || "google/flan-t5-large";
// // const HF_TTS_MODEL = process.env.HF_TTS_MODEL || null; // якщо null — не робимо TTS через HF

// // // POST /api/generate/keywords  { sessionId }
// // router.post("/keywords", async (req, res) => {
// //   try {
// //     const { sessionId } = req.body;
// //     if (!sessionId) return res.status(400).json({ error: "sessionId required" });

// //     // знаходимо файл у TMP (припускаємо, що файли збережені як sessionId + ext)
// //     const files = await fs.readdir(TEMP_DIR);
// //     const matching = files.find(f => f.startsWith(sessionId));
// //     if (!matching) return res.status(404).json({ error: "No file for this session" });

// //     const filePath = path.join(TEMP_DIR, matching);
// //     const text = await extractTextFromPath(filePath);
// //     const keywords = extractKeywords(text, 20);

// //     res.json({ keywords });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // // POST /api/generate  { sessionId, difficulty, selectedKeywords: [], withAudio: boolean, showAnswers: boolean }
// // router.post("/", async (req, res) => {
// //   try {
// //     const { sessionId, difficulty = "medium", selectedKeywords = [], withAudio = false, showAnswers = false } = req.body;

// //     if (!sessionId) return res.status(400).json({ error: "sessionId required" });

// //     const files = await fs.readdir(TEMP_DIR);
// //     const matching = files.find(f => f.startsWith(sessionId));
// //     if (!matching) return res.status(404).json({ error: "No file for this session" });

// //     const filePath = path.join(TEMP_DIR, matching);
// //     const text = await extractTextFromPath(filePath);

// //     // Формуємо prompt, включаємо ключові слова та складність
// //     const keywordsStr = (selectedKeywords && selectedKeywords.length) ? selectedKeywords.join(", ") : "the main topics";
// //     const prompt = `
// //       Generate a set of test questions based on the following text.
// //       Difficulty level: ${difficulty}.
// //       Focus on key concepts: ${keywordsStr}.""}
// //       Text:
// //       """${text}"""
// //       Provide output as numbered questions.`;
// //     // виклик HF
// //     const generated = await hfGenerateText(HF_MODEL, prompt, { maxTokens: 400, temperature: 0.1 });

// //     // збережемо результат у файлі JSON тимчасово
// //     const outJsonPath = path.join(TEMP_DIR, `${sessionId}_result.json`);
// //     await fs.writeFile(outJsonPath, JSON.stringify({ generated }, null, 2), "utf8");

// //     let audioPath = null;
// //     if (withAudio && HF_TTS_MODEL) {
// //       // згенеруємо аудіо з текстом питань (генерація аудіо може бути великою — можливо, треба розбити)
// //       const outFile = path.join(TEMP_DIR, `${sessionId}_questions.mp3`);
// //       audioPath = await hfTextToSpeech(HF_TTS_MODEL, generated, outFile);
// //     }

// //     // повертаємо результат (генерація як текст)
// //     res.json({ success: true, generated, audioPath: audioPath ? `/api/tmp/${path.basename(audioPath)}` : null });

// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // export default router;


// import express from "express";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import { hfGenerateQuestions } from "../services/questionsGenerator.js";
// import { getSession, updateSession } from "../utils/sessionManager.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Додаємо константу TEMP_STORAGE
// const TEMP_STORAGE = path.join(__dirname, "..", "tempQuestions");

// const router = express.Router();

// // Перевіряємо, що папка існує
// if (!fs.existsSync(TEMP_STORAGE)) {
//   fs.mkdirSync(TEMP_STORAGE, { recursive: true });
//   console.log("Створено директорію для результатів:", TEMP_STORAGE);
// }

// // Глобальний об'єкт для відстеження прогресу
// const generationProgress = new Map();

// // POST /api/questions - запуск генерації питань
// router.post("/", async (req, res) => {
//   console.log("Отримано запит на генерацію питань:", req.body);
//   try {
//     const { 
//       sessionId, 
//       singleChoice, 
//       multipleChoice, 
//       trueFalse, 
//       shortAnswer, 
//       difficulty, 
//       keywords = [] 
//     } = req.body;

//     if (!sessionId) {
//       return res.status(400).json({ error: "sessionId required" });
//     }

//     // Перевіряємо сесію
//     const session = getSession(sessionId);
//     if (!session) {
//       return res.status(404).json({ error: "Сесія не знайдена" });
//     }

//     // Ініціалізуємо прогрес
//     generationProgress.set(sessionId, {
//       progress: 0,
//       status: "starting",
//       questions: [],
//       isPaused: false,
//       isCancelled: false
//     });

//     // Запускаємо генерацію в фоновому режимі
//     generateQuestionsAsync(sessionId, {
//       singleChoice: parseInt(singleChoice) || 0,
//       multipleChoice: parseInt(multipleChoice) || 0,
//       trueFalse: parseInt(trueFalse) || 0,
//       shortAnswer: parseInt(shortAnswer) || 0,
//       difficulty,
//       keywords,
//       filePath: session.filePath
//     });

//     res.json({ 
//       success: true, 
//       message: "Генерація розпочата",
//       sessionId 
//     });

//   } catch (err) {
//     console.error("Error starting generation:", err);
//     res.status(500).json({ error: "Помилка запуску генерації" });
//   }
// });

// // GET /api/generate/progress/:sessionId - отримання прогресу
// router.get("/progress/:sessionId", (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const progress = generationProgress.get(sessionId);
    
//     if (!progress) {
//       return res.status(404).json({ error: "Прогрес не знайдено" });
//     }

//     res.json({
//       progress: progress.progress,
//       status: progress.status,
//       questions: progress.questions,
//       isPaused: progress.isPaused,
//       isCancelled: progress.isCancelled
//     });
//   } catch (err) {
//     console.error("Error getting progress:", err);
//     res.status(500).json({ error: "Помилка отримання прогресу" });
//   }
// });

// // PUT /api/generate/pause/:sessionId - пауза генерації
// router.put("/pause/:sessionId", (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const progress = generationProgress.get(sessionId);
    
//     if (!progress) {
//       return res.status(404).json({ error: "Прогрес не знайдено" });
//     }

//     progress.isPaused = true;
//     progress.status = "paused";
    
//     res.json({ success: true, status: "paused" });
//   } catch (err) {
//     console.error("Error pausing generation:", err);
//     res.status(500).json({ error: "Помилка паузи" });
//   }
// });

// // PUT /api/generate/resume/:sessionId - продовження генерації
// router.put("/resume/:sessionId", (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const progress = generationProgress.get(sessionId);
    
//     if (!progress) {
//       return res.status(404).json({ error: "Прогрес не знайдено" });
//     }

//     progress.isPaused = false;
//     progress.status = "generating";
    
//     res.json({ success: true, status: "generating" });
//   } catch (err) {
//     console.error("Error resuming generation:", err);
//     res.status(500).json({ error: "Помилка продовження" });
//   }
// });

// // DELETE /api/generate/cancel/:sessionId - скасування генерації
// router.delete("/cancel/:sessionId", (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const progress = generationProgress.get(sessionId);
    
//     if (!progress) {
//       return res.status(404).json({ error: "Прогрес не знайдено" });
//     }

//     progress.isCancelled = true;
//     progress.status = "cancelled";
    
//     // Очищаємо через 5 секунд
//     setTimeout(() => {
//       generationProgress.delete(sessionId);
//     }, 5000);
    
//     res.json({ success: true, status: "cancelled" });
//   } catch (err) {
//     console.error("Error cancelling generation:", err);
//     res.status(500).json({ error: "Помилка скасування" });
//   }
// });

// // Функція асинхронної генерації
// async function generateQuestionsAsync(sessionId, config) {
//   try {
//     const progress = generationProgress.get(sessionId);
//     if (!progress) return;

//     progress.status = "generating";
    
//     // Генеруємо запитання
//     const questions = await hfGenerateQuestions(config, (currentProgress) => {
//       const progressObj = generationProgress.get(sessionId);
//       if (progressObj && !progressObj.isPaused && !progressObj.isCancelled) {
//         progressObj.progress = currentProgress;
//       }
//     }, () => {
//       const progressObj = generationProgress.get(sessionId);
//       return progressObj ? progressObj.isPaused || progressObj.isCancelled : true;
//     });

//     if (progress.isCancelled) {
//       return;
//     }

//     // Оновлюємо прогрес
//     progress.progress = 100;
//     progress.status = "completed";
//     progress.questions = questions;

//     // Зберігаємо результати в сесії
//     updateSession(sessionId, { questions });

//     // === ДОДАЄМО ЗБЕРЕЖЕННЯ В ФАЙЛ ТУТ ===
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

//     console.log(`Результати збережено у файл: ${resultsPath}`);

//   } catch (err) {
//     console.error("Error in async generation:", err);
//     const progress = generationProgress.get(sessionId);
//     if (progress) {
//       progress.status = "error";
//       progress.error = err.message;
//     }
//   }
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

// Папка для збереження результатів
const TEMP_STORAGE = path.join(__dirname, "..", "..", "..", "tempQuestions");

const router = express.Router();

// Перевіряємо, що папка існує
if (!fs.existsSync(TEMP_STORAGE)) {
  fs.mkdirSync(TEMP_STORAGE, { recursive: true });
  console.log("✅ Створено директорію для результатів:", TEMP_STORAGE);
}

// Глобальний об'єкт для відстеження прогресу
const generationProgress = new Map();

// POST /api/questions - запуск генерації питань
router.post("/", async (req, res) => {
  console.log("📥 Отримано запит на генерацію питань:", req.body);
  
  try {
    const { 
      sessionId, 
      singleChoice = 0, 
      multipleChoice = 0, 
      trueFalse = 0, 
      shortAnswer = 0, 
      difficulty = "medium", 
      keywords = [] 
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId обов'язковий" });
    }

    // Перевіряємо сесію
    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Сесія не знайдена" });
    }

    // Перевіряємо, що є запитання для генерації
    const totalQuestions = parseInt(singleChoice) + parseInt(multipleChoice) + 
                          parseInt(trueFalse) + parseInt(shortAnswer);
    
    if (totalQuestions === 0) {
      return res.status(400).json({ error: "Вкажіть кількість запитань для генерації" });
    }

    // Ініціалізуємо прогрес
    generationProgress.set(sessionId, {
      progress: 0,
      status: "starting",
      questions: [],
      isPaused: false,
      isCancelled: false,
      error: null
    });

    // Запускаємо генерацію в фоновому режимі
    generateQuestionsAsync(sessionId, {
      singleChoice: parseInt(singleChoice),
      multipleChoice: parseInt(multipleChoice),
      trueFalse: parseInt(trueFalse),
      shortAnswer: parseInt(shortAnswer),
      difficulty,
      keywords,
      filePath: session.filePath
    });

    res.json({ 
      success: true, 
      message: "Генерація питань розпочата",
      sessionId,
      totalQuestions
    });

  } catch (err) {
    console.error("❌ Помилка запуску генерації:", err);
    res.status(500).json({ error: "Помилка запуску генерації: " + err.message });
  }
});

// GET /api/questions/progress/:sessionId - отримання прогресу
router.get("/progress/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const progress = generationProgress.get(sessionId);
    
    if (!progress) {
      return res.status(404).json({ error: "Прогрес не знайдено" });
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

// PUT /api/questions/pause/:sessionId - пауза генерації
router.put("/pause/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const progress = generationProgress.get(sessionId);
    
    if (!progress) {
      return res.status(404).json({ error: "Прогрес не знайдено" });
    }

    progress.isPaused = true;
    progress.status = "paused";
    
    res.json({ success: true, status: "paused" });
  } catch (err) {
    console.error("❌ Помилка паузи генерації:", err);
    res.status(500).json({ error: "Помилка паузи" });
  }
});

// PUT /api/questions/resume/:sessionId - продовження генерації
router.put("/resume/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const progress = generationProgress.get(sessionId);
    
    if (!progress) {
      return res.status(404).json({ error: "Прогрес не знайдено" });
    }

    progress.isPaused = false;
    progress.status = "generating";
    
    res.json({ success: true, status: "generating" });
  } catch (err) {
    console.error("❌ Помилка продовження генерації:", err);
    res.status(500).json({ error: "Помилка продовження" });
  }
});

// DELETE /api/questions/cancel/:sessionId - скасування генерації
router.delete("/cancel/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const progress = generationProgress.get(sessionId);
    
    if (!progress) {
      return res.status(404).json({ error: "Прогрес не знайдено" });
    }

    progress.isCancelled = true;
    progress.status = "cancelled";
    
    // Очищаємо через 5 секунд
    setTimeout(() => {
      generationProgress.delete(sessionId);
    }, 5000);
    
    res.json({ success: true, status: "cancelled" });
  } catch (err) {
    console.error("❌ Помилка скасування генерації:", err);
    res.status(500).json({ error: "Помилка скасування" });
  }
});

// Функція асинхронної генерації
async function generateQuestionsAsync(sessionId, config) {
  let progress;
  
  try {
    progress = generationProgress.get(sessionId);
    if (!progress) return;

    progress.status = "generating";
    
    console.log(`🚀 Запуск генерації ${getTotalQuestions(config)} питань для сесії ${sessionId}`);
    
    // Генеруємо запитання
    const questions = await hfGenerateQuestions(config, (currentProgress) => {
      const progressObj = generationProgress.get(sessionId);
      if (progressObj && !progressObj.isPaused && !progressObj.isCancelled) {
        progressObj.progress = currentProgress;
      }
    }, () => {
      const progressObj = generationProgress.get(sessionId);
      return progressObj ? progressObj.isPaused || progressObj.isCancelled : true;
    });

    if (progress.isCancelled) {
      console.log(`❌ Генерація скасована для сесії ${sessionId}`);
      return;
    }

    // Оновлюємо прогрес
    progress.progress = 100;
    progress.status = "completed";
    progress.questions = questions;

    // Зберігаємо результати в сесії
    updateSession(sessionId, { questions });

    // Зберігаємо результати в файл
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
    console.error("❌ Помилка в асинхронній генерації:", err);
    
    if (progress) {
      progress.status = "error";
      progress.error = err.message;
    }
  }
}

// Допоміжна функція для підрахунку загальної кількості питань
function getTotalQuestions(config) {
  return config.singleChoice + config.multipleChoice + config.trueFalse + config.shortAnswer;
}

export default router;
