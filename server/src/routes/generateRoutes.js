import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { hfGenerateQuestions } from "../services/questionsGenerator.js";
import { getSession, updateSession } from "../utils/sessionManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_STORAGE = path.join(__dirname, "..", "..", "tempQuestions");
const router = express.Router();

if (!fs.existsSync(TEMP_STORAGE)) {
  fs.mkdirSync(TEMP_STORAGE, { recursive: true });
}

const generationProgress = new Map();

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
      (currentProgress) => {
        const current = generationProgress.get(sessionId);
        if (current && !current.isPaused && !current.isCancelled) {
          current.progress = currentProgress;
        }
      },
      () => {
        const current = generationProgress.get(sessionId);
        return !current || current.isPaused || current.isCancelled;
      }
    );

    const finalProgress = generationProgress.get(sessionId);
    if (!finalProgress || finalProgress.isCancelled) {
      console.log(`⏹️ Генерацію скасовано для сесії ${sessionId}`);
      return;
    }

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