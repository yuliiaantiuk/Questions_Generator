import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { createSession } from "../utils/sessionManager.js"; 
import { pdfToText } from "../utils/pdfToText.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_STORAGE = path.join(__dirname, "..", "..", "temp");

// Check and create TEMP_STORAGE directory if it doesn't exist
if (!fs.existsSync(TEMP_STORAGE)) {
  fs.mkdirSync(TEMP_STORAGE, { recursive: true });
  console.log("Created directory:", TEMP_STORAGE);
}

// Saving text data
export const handleTextUpload = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 500)
      return res.status(400).json({ error: "Текст має містити щонайменше 500 слів" });

    const sessionId = uuidv4();
    const filePath = path.join(TEMP_STORAGE, `${sessionId}.txt`);

    fs.writeFileSync(filePath, text, "utf-8");

    // after successful save — register the session
    createSession(sessionId, filePath);

    res.status(200).json({ message: "Text saved", sessionId });
    console.log("Text saved at:", filePath);
  } catch (error) {
    console.error("Error saving text:", error);
    res.status(500).json({ error: "Error saving text" });
  }
};

export const handleFileUpload = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "File not uploaded" });

    const sessionId = uuidv4();
    const ext = path.extname(req.file.originalname).toLowerCase();

    // parsing file before moving
    let textContent = "";
    if (ext === ".txt") {
      textContent = fs.readFileSync(req.file.path, "utf8");
    } else if (ext === ".pdf") {
      textContent = await pdfToText(req.file.path);
    } else if (ext === ".docx" || ext === ".doc") {
      const mammoth = (await import("mammoth")).default;
      textContent = (await mammoth.extractRawText({ path: req.file.path })).value;
    }

    const wordCount = textContent.trim().split(/\s+/).length;
    if (wordCount < 500 || wordCount > 1000000) {
      fs.unlinkSync(req.file.path); // delete temporary file
      return res.status(400).json({ 
        error: `Файл має ${wordCount} слів. Дозволено від 500 до 1 000 000.` 
      });
    }

    // move to TEMP_STORAGE
    const newFileName = `${sessionId}.txt`;
    const newPath = path.join(TEMP_STORAGE, newFileName);
    fs.writeFileSync(newPath, textContent, "utf8");

    // create session 
    createSession(sessionId, newPath);

    res.status(200).json({ message: "Файл збережено", sessionId });
    console.log("Файл збережено у:", newPath);

  } catch (error) {
    console.error("Помилка збереження файлу:", error);
    res.status(500).json({ error: "Помилка збереження файлу" });
  }
};

