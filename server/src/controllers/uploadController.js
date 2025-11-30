import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { createSession } from "../utils/sessionManager.js"; 
import { pdfToText } from "../utils/pdfToText.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_STORAGE = path.join(__dirname, "..", "..", "temp");
// console.log("TEMP_STORAGE у uploadController:", TEMP_STORAGE);

// перевіряємо, що директорія існує
if (!fs.existsSync(TEMP_STORAGE)) {
  fs.mkdirSync(TEMP_STORAGE, { recursive: true });
  console.log("Створено директорію:", TEMP_STORAGE);
}

// Збереження текстових даних
export const handleTextUpload = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 500)
      return res.status(400).json({ error: "Текст має містити щонайменше 500 слів" });

    const sessionId = uuidv4();
    const filePath = path.join(TEMP_STORAGE, `${sessionId}.txt`);

    fs.writeFileSync(filePath, text, "utf-8");

    // після успішного збереження — реєструємо сесію
    createSession(sessionId, filePath);

    res.status(200).json({ message: "Текст збережено", sessionId });
    console.log("Текст збережено у:", filePath);
  } catch (error) {
    console.error("Помилка збереження тексту:", error);
    res.status(500).json({ error: "Помилка збереження тексту" });
  }
};

export const handleFileUpload = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "Файл не завантажено" });

    const sessionId = uuidv4();
    const ext = path.extname(req.file.originalname).toLowerCase();

    // парсинг файлу до переміщення
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
      fs.unlinkSync(req.file.path); // видаляємо тимчасовий файл
      return res.status(400).json({ 
        error: `Файл має ${wordCount} слів. Дозволено від 500 до 1 000 000.` 
      });
    }

    // переміщення файлу в TEMP_STORAGE
    const newFileName = `${sessionId}.txt`;
    const newPath = path.join(TEMP_STORAGE, newFileName);
    // fs.renameSync(req.file.path, newPath);
    fs.writeFileSync(newPath, textContent, "utf8");

    // створення сесії 
    createSession(sessionId, newPath);

    res.status(200).json({ message: "Файл збережено", sessionId });
    console.log("Файл збережено у:", newPath);

  } catch (error) {
    console.error("Помилка збереження файлу:", error);
    res.status(500).json({ error: "Помилка збереження файлу" });
  }
};

