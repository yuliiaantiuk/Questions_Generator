import express from "express";
import fs from "fs";
import path from "path";
import mammoth from "mammoth"; 
import { fileURLToPath } from "url";
import { extractKeywords } from "../services/keywordExtractor.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");


const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_STORAGE = path.join(__dirname, "..", "..", "temp");

console.log("TEMP_STORAGE у keywordsRoutes:", TEMP_STORAGE);


// POST /api/generate/keywords
router.post("/keywords", async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "sessionId відсутній" });

    // шукаємо файл у папці temp
    const files = fs.readdirSync(TEMP_STORAGE);
    const fileName = files.find(f => f.startsWith(sessionId));
    if (!fileName) return res.status(404).json({ error: "Файл не знайдено" });

    const filePath = path.join(TEMP_STORAGE, fileName);
    const ext = path.extname(filePath).toLowerCase();

    let textContent = "";

    // Конвертуємо залежно від типу файлу
    if (ext === ".txt") {
      textContent = fs.readFileSync(filePath, "utf8");
    } else if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      textContent = pdfData.text;
    } else if (ext === ".docx") {
      const data = await mammoth.extractRawText({ path: filePath });
      textContent = data.value;
    } else {
      return res.status(400).json({ error: "Непідтримуваний формат файлу" });
    }

    if (!textContent.trim()) {
      return res.status(400).json({ error: "Файл порожній або нечитабельний" });
    }

    console.log("extractKeywords() викликається!");

    // Витягуємо ключові слова
    const keywords = extractKeywords(textContent, 20);
    console.log("Витягнуті ключові слова:", keywords);

    res.json({ keywords });
  } catch (error) {
    console.error("Помилка при витягуванні ключових слів:", error);
    res.status(500).json({ error: "Не вдалося отримати ключові слова" });
  }
});

export default router;