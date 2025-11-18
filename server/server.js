import express from "express";
import cors from "cors";
import generateRoutes from "./src/routes/generateRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import sessionRoutes from "./src/routes/sessionRoutes.js";
import fs from "fs";
import keywordRoutes from "./src/routes/keywordsRoutes.js";
import ttsRoutes from "./src/routes/ttsRoutes.js";
import dotenv from "dotenv";
import ttsProxyRoutes from './src/routes/ttsProxyRoutes.js';
dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json({ limit: "10mb" })); // розширити при потребі
app.use("/api/session", sessionRoutes);

// тимчасова папка як статична для аудіо/результатів
import path from "path";

import pathModule from "path";

import { fileURLToPath } from "url";

// Створюємо власний __dirname для ES-модуля
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Тепер можна безпечно використовувати __dirname
const TEMP_STORAGE = path.join(__dirname, "temp");
console.log("TEMP_STORAGE у server.js:", TEMP_STORAGE);

function clearTempOnStartup() {
  console.log("Очищення TEMP_STORAGE:", TEMP_STORAGE);
  if (fs.existsSync(TEMP_STORAGE)) {
    console.log("Папка існує, очищаємо...");
    for (const file of fs.readdirSync(TEMP_STORAGE)) {
      const filePath = path.join(TEMP_STORAGE, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`Видалено старий файл при запуску: ${file}`);
      } catch (err) {
        console.error(`Помилка видалення ${file}:`, err);
      }
    }
  } else {
    console.log("Папку не знайдено:", TEMP_STORAGE);
  }
}

clearTempOnStartup();

app.use("/api/tmp", express.static(TEMP_STORAGE));

// підключаємо маршрути
app.use("/api/generate", keywordRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/questions", generateRoutes);
app.use("/api/tts", ttsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));

