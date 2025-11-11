import express from "express";
import fs from "fs";
import path from "path";
import fetch from "node-fetch"; 
import crypto from "crypto";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Папка для тимчасових файлів
const TEMP_DIR = path.join(__dirname, "..", "..", "temp");

const router = express.Router();

router.post("/keywords", async (req, res) => {
  try {
    // Отримуємо sessionId файлу з фронтенду
    const { sessionId: fileSessionId } = req.body;
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

    // Генеруємо textSessionId для Python-кешу (MD5 тексту)
    const textSessionId = crypto.createHash("md5").update(textContent).digest("hex");

    // Викликаємо Python FastAPI сервіс для ключових слів
    const PY_URL = process.env.PY_KEYWORDS_URL || "http://127.0.0.1:8000/keywords";
    const response = await fetch(PY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        text: textContent, 
        top_n: 10, 
        session_id: textSessionId  // передаємо textSessionId для кешу
      })
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("Python service error:", response.status, txt);
      return res.status(500).json({ error: "Keyword service error" });
    }

    const keywords = await response.json();

    // Повертаємо на фронтенд обидва sessionId і ключові слова
    return res.json({ 
      fileSessionId,   // для ідентифікації файлу на Node.js
      textSessionId,   // для кешування ключових слів на Python
      keywords 
    });

  } catch (err) {
    console.error("Error in keywords route:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
