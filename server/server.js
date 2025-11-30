import express from "express";
import cors from "cors";
import generateRoutes from "./src/routes/generateRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import sessionRoutes from "./src/routes/sessionRoutes.js";
import fs from "fs";
import keywordRoutes from "./src/routes/keywordsRoutes.js";
import ttsRoutes from "./src/routes/ttsRoutes.js";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json({ limit: "10mb" })); 
app.use("/api/session", sessionRoutes);

import { fileURLToPath } from "url";

// Створюємо власний __dirname для ES-модуля
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Тепер можна безпечно використовувати __dirname
const TEMP_STORAGE = path.join(__dirname, "temp");
const TEMP_QUESTIONS = path.join(__dirname, "tempQuestions");

// console.log("TEMP_STORAGE у server.js:", TEMP_STORAGE);
// console.log("TEMP_QUESTIONS у server.js:", TEMP_QUESTIONS);

function cleanOldQuestions() {
  // console.log("Перевірка старих питань...");
  
  const foldersToClean = [TEMP_QUESTIONS];
  const maxAge = 24 * 60 * 60 * 1000; 
  const now = Date.now();
  let totalCleaned = 0;

  foldersToClean.forEach(folder => {
    if (!fs.existsSync(folder)) {
      console.log(`Папка не існує: ${folder}`);
      return;
    }

    try {
      const files = fs.readdirSync(folder);
      let folderCleaned = 0;

      files.forEach(file => {
        const filePath = path.join(folder, file);
        
        try {
          const stats = fs.statSync(filePath);
          const fileAge = now - stats.mtime.getTime();

          // Видаляємо файли старші за 24 години
          if (fileAge > maxAge) {
            fs.unlinkSync(filePath);
            console.log(`Видалено старий файл: ${file} (${Math.round(fileAge / (60 * 60 * 1000))} год.)`);
            folderCleaned++;
            totalCleaned++;
          }
        } catch (err) {
          console.error(`Помилка перевірки файлу ${file}:`, err.message);
        }
      });

      if (folderCleaned > 0) {
        console.log(`З папки ${path.basename(folder)} видалено ${folderCleaned} файлів`);
      }

    } catch (err) {
      console.error(`Помилка читання папки ${folder}:`, err.message);
    }
  });

  if (totalCleaned > 0) {
    console.log(`Всього видалено ${totalCleaned} старих файлів`);
  } else {
    console.log("Старих файлів не знайдено");
  }
}

function startPeriodicCleanup() {
  cleanOldQuestions();
  
  setInterval(cleanOldQuestions, 6 * 60 * 60 * 1000);
  console.log("Запущено періодичне очищення");
}

function clearTempOnStartup() {
  // console.log("Очищення тимчасових файлів при запуску");
  
  const foldersToClear = [TEMP_STORAGE, TEMP_QUESTIONS];
  
  foldersToClear.forEach(folder => {
    if (!fs.existsSync(folder)) {
      console.log(`Папка не існує: ${folder}`);
      return;
    }

    try {
      const files = fs.readdirSync(folder);
      let clearedCount = 0;

      files.forEach(file => {
        const filePath = path.join(folder, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`Видалено файл: ${file}`);
          clearedCount++;
        } catch (err) {
          console.error(`Помилка видалення ${file}:`, err.message);
        }
      });

      // console.log(`З папки ${path.basename(folder)} видалено ${clearedCount} файлів`);

    } catch (err) {
      console.error(`Помилка читання папки ${folder}:`, err.message);
    }
  });
}

clearTempOnStartup();
startPeriodicCleanup();

app.use("/api/tmp", express.static(TEMP_STORAGE));

// підключаємо маршрути
app.use("/api/generate", keywordRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/questions", generateRoutes);
app.use("/api/tts", ttsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));

