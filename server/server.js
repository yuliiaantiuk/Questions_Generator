import express from "express";
import cors from "cors";
import generateRoutes from "./src/routes/generateRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import sessionRoutes from "./src/routes/sessionRoutes.js";
import fs from "fs";

// import resultsRoutes from "./src/routes/resultsRoutes.js";
// import { router as resultsRoutes } from "./src/routes/resultsRoutes.js";


import dotenv from "dotenv";
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
const TEMP_STORAGE = path.join(__dirname, "src", "temp");


function clearTempOnStartup() {
  if (fs.existsSync(TEMP_STORAGE)) {
    for (const file of fs.readdirSync(TEMP_STORAGE)) {
      const filePath = path.join(TEMP_STORAGE, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`Видалено старий файл при запуску: ${file}`);
      } catch (err) {
        console.error(`Помилка видалення ${file}:`, err);
      }
    }
  }
}

clearTempOnStartup();

const TEMP_DIR = process.env.TEMP_DIR || pathModule.resolve(process.cwd(), "temp");
app.use("/api/tmp", express.static(TEMP_DIR));

// підключаємо маршрути
app.use("/api/generate", generateRoutes);
app.use("/api/upload", uploadRoutes);
// app.use("/api/results", resultsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));

