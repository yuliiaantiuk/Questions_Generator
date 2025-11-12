import express from "express";
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; 
import crypto from "crypto";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import { pdfToText } from "../utils/pdfToText.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, "..", "..", "temp");
const PY_URL = process.env.PY_KEYWORDS_URL || "http://127.0.0.1:8000";

const router = express.Router();

router.post("/keywords", async (req, res) => {
  try {
    const { sessionId: fileSessionId, forceRegenerate = false } = req.body;
    if (!fileSessionId) return res.status(400).json({ error: "sessionId required" });

    // Перевіряємо існування папки temp
    if (!fs.existsSync(TEMP_DIR)) {
      return res.status(500).json({ error: "Temp dir not found on server" });
    }

    // Шукаємо файл користувача
    const files = fs.readdirSync(TEMP_DIR);
    const fileName = files.find(f => f.startsWith(fileSessionId));
    if (!fileName) return res.status(404).json({ error: "File not found" });

    const filePath = path.join(TEMP_DIR, fileName);
    const ext = path.extname(filePath).toLowerCase();

    // Витягуємо текст залежно від формату
    let textContent = "";
    if (ext === ".txt") {
      textContent = fs.readFileSync(filePath, "utf8");
    } else if (ext === ".pdf") {
      textContent = await pdfToText(filePath);
    }
 else if (ext === ".docx" || ext === ".doc") {
      const mammoth = (await import("mammoth")).default;
      const data = await mammoth.extractRawText({ path: filePath });
      textContent = data.value;
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    if (!textContent || !textContent.trim()) {
      return res.status(400).json({ error: "Empty or unreadable file" });
    }

    // Генеруємо textSessionId для Python-кешу (MD5 тексту)
    const textSessionId = crypto.createHash("md5").update(textContent).digest("hex");

    // Якщо не форсована регенерація, спробуємо отримати збережені ключові слова
    if (!forceRegenerate) {
      try {
        const savedResponse = await fetch(`${PY_URL}/get_keywords/${textSessionId}`);
        if (savedResponse.ok) {
          const savedKeywords = await savedResponse.json();
          console.log("Знайдено збережені ключові слова, кількість:", savedKeywords.length);
          
          // Якщо є збережені ключові слова - повертаємо їх
          if (savedKeywords && savedKeywords.length > 0) {
            return res.json({ 
              fileSessionId,
              textSessionId,
              keywords: savedKeywords,
              fromCache: true
            });
          }
        }
      } catch (error) {
        console.log("Збережених ключових слів не знайдено, генеруємо нові");
      }
    }

    // Генеруємо нові ключові слова
    console.log("Генерація нових ключових слів...");
    const response = await fetch(`${PY_URL}/keywords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        text: textContent, 
        top_n: 10, 
        session_id: textSessionId
      })
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("Python service error:", response.status, txt);
      return res.status(500).json({ error: "Keyword service error" });
    }

    const keywords = await response.json();
    console.log("Згенеровано нових ключових слів:", keywords.length);

    return res.json({ 
      fileSessionId,
      textSessionId,
      keywords,
      fromCache: false
    });

  } catch (err) {
    console.error("Error in keywords route:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/generate/keywords - оновлення ключових слів
router.put("/keywords", async (req, res) => {
  try {
    const { textSessionId, keywords } = req.body;
    
    if (!textSessionId || !keywords) {
      return res.status(400).json({ error: "textSessionId and keywords required" });
    }

    // Оновлюємо ключові слова в Python сервісі
    const response = await fetch(`${PY_URL}/save_keywords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: textSessionId,
        keywords: keywords
      })
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("Python service error:", response.status, txt);
      return res.status(500).json({ error: "Failed to save keywords" });
    }

    console.log("Ключові слова оновлено для sessionId:", textSessionId);
    return res.json({ status: "saved", keywordsCount: keywords.length });

  } catch (err) {
    console.error("Error saving keywords:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

