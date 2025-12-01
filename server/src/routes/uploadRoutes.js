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

// Setting up multer for file uploads
const upload = multer({ 
  dest: UPLOAD_DIR,
  fileFilter: (req, file, cb) => {
    const allowedFormats = ['.txt', '.doc', '.docx', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format'), false);
    }
  }
});

const router = express.Router();

// Text upload
router.post("/text", handleTextUpload);

// File upload
router.post("/file", upload.single("file"), handleFileUpload);

// File restore
router.get("/restore/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);
    
    if (!session || !session.filePath) {
      return res.status(404).json({ error: "File not found" });
    }

    if (!fs.existsSync(session.filePath)) {
      return res.status(404).json({ error: "File no longer exists" });
    }

    res.sendFile(session.filePath);
  } catch (error) {
    console.error("Error restoring file:", error);
    res.status(500).json({ error: "Error restoring file" });
  }
});

export default router;
