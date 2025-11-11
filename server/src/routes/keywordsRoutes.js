// // import express from "express";
// // import fs from "fs";
// // import path from "path";
// // import mammoth from "mammoth"; 
// // import { fileURLToPath } from "url";
// // import { extractKeywords } from "../services/keywordExtractor.js";

// // import { createRequire } from "module";
// // const require = createRequire(import.meta.url);
// // const pdfParse = require("pdf-parse");


// // const router = express.Router();
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);
// // const TEMP_STORAGE = path.join(__dirname, "..", "..", "temp");

// // console.log("TEMP_STORAGE у keywordsRoutes:", TEMP_STORAGE);


// // // POST /api/generate/keywords
// // router.post("/keywords", async (req, res) => {
// //   try {
// //     const { sessionId } = req.body;
// //     if (!sessionId) return res.status(400).json({ error: "sessionId відсутній" });

// //     // шукаємо файл у папці temp
// //     const files = fs.readdirSync(TEMP_STORAGE);
// //     const fileName = files.find(f => f.startsWith(sessionId));
// //     if (!fileName) return res.status(404).json({ error: "Файл не знайдено" });

// //     const filePath = path.join(TEMP_STORAGE, fileName);
// //     const ext = path.extname(filePath).toLowerCase();

// //     let textContent = "";

// //     // Конвертуємо залежно від типу файлу
// //     if (ext === ".txt") {
// //       textContent = fs.readFileSync(filePath, "utf8");
// //     } else if (ext === ".pdf") {
// //       const dataBuffer = fs.readFileSync(filePath);
// //       const pdfData = await pdfParse(dataBuffer);
// //       textContent = pdfData.text;
// //     } else if (ext === ".docx") {
// //       const data = await mammoth.extractRawText({ path: filePath });
// //       textContent = data.value;
// //     } else {
// //       return res.status(400).json({ error: "Непідтримуваний формат файлу" });
// //     }

// //     if (!textContent.trim()) {
// //       return res.status(400).json({ error: "Файл порожній або нечитабельний" });
// //     }

// //     console.log("extractKeywords() викликається!");

// //     // Витягуємо ключові слова
// //     const keywords = extractKeywords(textContent, 20);
// //     console.log("Витягнуті ключові слова:", keywords);

// //     res.json({ keywords });
// //   } catch (error) {
// //     console.error("Помилка при витягуванні ключових слів:", error);
// //     res.status(500).json({ error: "Не вдалося отримати ключові слова" });
// //   }
// // });

// // export default router;

// import express from "express";
// import fs from "fs";
// import path from "path";
// import mammoth from "mammoth"; 
// import { fileURLToPath } from "url";
// import { extractKeywords, checkPythonServiceHealth } from "../services/keywordExtractor.js";

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// const pdfParse = require("pdf-parse");

// const router = express.Router();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const TEMP_STORAGE = path.join(__dirname, "..", "..", "temp");

// console.log("TEMP_STORAGE у keywordsRoutes:", TEMP_STORAGE);

// // Додаємо ендпоінт для перевірки стану Python сервісу
// router.get("/health-check", async (req, res) => {
//   try {
//     const isHealthy = await checkPythonServiceHealth();
//     res.json({ 
//       pythonService: isHealthy ? 'available' : 'unavailable',
//       nodeService: 'running'
//     });
//   } catch (error) {
//     res.json({ 
//       pythonService: 'error', 
//       nodeService: 'running',
//       error: error.message 
//     });
//   }
// });

// // POST /api/generate/keywords
// router.post("/keywords", async (req, res) => {
//   try {
//     const { sessionId } = req.body;
//     if (!sessionId) return res.status(400).json({ error: "sessionId відсутній" });

//     console.log("🔍 Шукаємо файл для sessionId:", sessionId);
//     console.log("📁 Шлях пошуку:", TEMP_STORAGE);

//     // Перевірка існування папки
//     if (!fs.existsSync(TEMP_STORAGE)) {
//       console.error("❌ Папка temp не існує:", TEMP_STORAGE);
//       return res.status(500).json({ error: "Тимчасова папка не існує" });
//     }

//     // Шукаємо файл у папці temp
//     const files = fs.readdirSync(TEMP_STORAGE);
//     console.log("📄 Файли в папці:", files);
    
//     const fileName = files.find(f => f.startsWith(sessionId));
//     if (!fileName) {
//       console.error("❌ Файл не знайдено для sessionId:", sessionId);
//       return res.status(404).json({ error: "Файл не знайдено" });
//     }

//     const filePath = path.join(TEMP_STORAGE, fileName);
//     console.log("📋 Повний шлях до файлу:", filePath);

//     // Додаткова перевірка існування файлу
//     if (!fs.existsSync(filePath)) {
//       console.error("❌ Файл не існує за шляхом:", filePath);
//       return res.status(404).json({ error: "Файл не знайдено" });
//     }

//     const ext = path.extname(filePath).toLowerCase();
//     let textContent = "";

//     console.log("📖 Конвертація файлу формату:", ext);

//     // Конвертуємо залежно від типу файлу
//     if (ext === ".txt") {
//       textContent = fs.readFileSync(filePath, "utf8");
//     } else if (ext === ".pdf") {
//       const dataBuffer = fs.readFileSync(filePath);
//       const pdfData = await pdfParse(dataBuffer);
//       textContent = pdfData.text;
//     } else if (ext === ".docx") {
//       const data = await mammoth.extractRawText({ path: filePath });
//       textContent = data.value;
//     } else {
//       return res.status(400).json({ error: "Непідтримуваний формат файлу" });
//     }

//     if (!textContent.trim()) {
//       return res.status(400).json({ error: "Файл порожній або нечитабельний" });
//     }

//     console.log("✅ Текст успішно витягнутий, довжина:", textContent.length);
//     console.log("🔤 Перші 200 символів тексту:", textContent.substring(0, 200));
    
//     // Витягуємо ключові слова через Python мікросервіс
//     console.log("🚀 Запуск генерації ключових слів...");
//     const keywords = await extractKeywords(textContent, 20);
//     console.log("🎯 Згенеровані ключові слова:", keywords);

//     res.json({ 
//       keywords,
//       textLength: textContent.length,
//       keywordsCount: keywords.length
//     });

//   } catch (error) {
//     console.error("❌ Помилка при витягуванні ключових слів:", error);
//     res.status(500).json({ 
//       error: "Не вдалося отримати ключові слова: " + error.message 
//     });
//   }
// });

// export default router;

// server/src/routes/keywordsRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; // якщо немає — встановити npm i node-fetch@2

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// припускаємо TEMP у server/temp (або як у тебе встановлено)
const TEMP_DIR = path.join(__dirname, "..", "..", "temp");

const router = express.Router();

router.post("/keywords", async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    if (!fs.existsSync(TEMP_DIR)) {
      return res.status(500).json({ error: "Temp dir not found on server" });
    }

    const files = fs.readdirSync(TEMP_DIR);
    const fileName = files.find(f => f.startsWith(sessionId));
    if (!fileName) return res.status(404).json({ error: "File not found" });

    const filePath = path.join(TEMP_DIR, fileName);
    const ext = path.extname(filePath).toLowerCase();

    let textContent = "";
    if (ext === ".txt") {
      textContent = fs.readFileSync(filePath, "utf8");
    } else if (ext === ".pdf") {
      // якщо вже маєш pdf-парсер у проекті - використай його
      const pdfParse = (await import("pdf-parse")).default;
      const buffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(buffer);
      textContent = pdfData.text;
    } else if (ext === ".docx" || ext === ".doc") {
      const mammoth = (await import("mammoth")).default;
      const data = await mammoth.extractRawText({ path: filePath });
      textContent = data.value;
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    if (!textContent || !textContent.trim()) {
      return res.status(400).json({ error: "Empty or unreadable file" });
    }

    // викликаємо Python сервіс
    const PY_URL = process.env.PY_KEYWORDS_URL || "http://127.0.0.1:8000/keywords";
    const response = await fetch(PY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textContent, top_n: 10 })
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("Python service error:", response.status, txt);
      return res.status(500).json({ error: "Keyword service error" });
    }

    const keywords = await response.json();
    return res.json({ keywords });
  } catch (err) {
    console.error("Error in keywords route:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
