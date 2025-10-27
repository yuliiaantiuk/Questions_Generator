import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const TEMP_STORAGE = path.join(process.cwd(), "server", "temp");

// переконайся, що папка існує
if (!fs.existsSync(TEMP_STORAGE)) fs.mkdirSync(TEMP_STORAGE, { recursive: true });

// Збереження текстових даних
export const handleTextUpload = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 500)
      return res.status(400).json({ error: "Текст має містити щонайменше 500 слів" });

    const sessionId = uuidv4();
    const filePath = path.join(TEMP_STORAGE, `${sessionId}.txt`);

    fs.writeFileSync(filePath, text, "utf-8");

    res.status(200).json({ message: "Текст збережено", sessionId });
  } catch (error) {
    res.status(500).json({ error: "Помилка збереження тексту" });
  }
};

// Збереження файлів (.txt, .doc, .pdf)
export const handleFileUpload = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "Файл не завантажено" });

    const sessionId = uuidv4();
    const ext = path.extname(req.file.originalname);
    const newFileName = `${sessionId}${ext}`;
    const newPath = path.join(TEMP_STORAGE, newFileName);

    fs.renameSync(req.file.path, newPath);

    res.status(200).json({ message: "Файл збережено", sessionId });
  } catch (error) {
    res.status(500).json({ error: "Помилка збереження файлу" });
  }
};
