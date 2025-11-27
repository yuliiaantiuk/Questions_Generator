import express from "express";
import multer from "multer";
import { handleTextUpload, handleFileUpload } from "../controllers/uploadController.js";
import { getSession } from "../utils/sessionManager.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "..", "..", "temp");

// Налаштування multer для завантаження файлів у папку temp
const upload = multer({ 
  dest: UPLOAD_DIR,
  fileFilter: (req, file, cb) => {
    const allowedFormats = ['.txt', '.doc', '.docx', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Непідтримуваний формат файлу'), false);
    }
  }
});

const router = express.Router();

// Завантаження тексту
router.post("/text", handleTextUpload);

// Завантаження файлу
router.post("/file", upload.single("file"), handleFileUpload);

// uploadRoutes.js - додати цей маршрут
router.get("/restore/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);
    
    if (!session || !session.filePath) {
      return res.status(404).json({ error: "Файл не знайдено" });
    }

    if (!fs.existsSync(session.filePath)) {
      return res.status(404).json({ error: "Файл більше не існує" });
    }

    res.sendFile(session.filePath);
  } catch (error) {
    console.error("Помилка відновлення файлу:", error);
    res.status(500).json({ error: "Помилка відновлення файлу" });
  }
});

export default router;
