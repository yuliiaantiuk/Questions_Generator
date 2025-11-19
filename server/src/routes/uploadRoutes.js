import express from "express";
import multer from "multer";
import { handleTextUpload, handleFileUpload } from "../controllers/uploadController.js";
import path from "path";
import { fileURLToPath } from "url";

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

export default router;
