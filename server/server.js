// const express = require('express');
// const cors = require('cors');
// const path = require('path');

// // Імпорт маршрутів
// const uploadRoutes = require('./src/routes/uploadRoutes');
// const generateRoutes = require('./src/routes/generateRoutes');
// const resultsRoutes = require('./src/routes/resultsRoutes');

// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware
// app.use(cors({
//     origin: 'http://localhost:5173', // Vite dev server
//     credentials: true
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // Базовий маршрут для перевірки
// app.get('/api/health', (req, res) => {
//     res.status(200).json({ 
//         status: 'OK', 
//         message: 'Сервер працює коректно',
//         timestamp: new Date().toISOString()
//     });
// });

// // Підключення маршрутів
// app.use('/api/upload', uploadRoutes);
// app.use('/api/generate', generateRoutes);
// app.use('/api/results', resultsRoutes);

// // Обробка незнайдених маршрутів
// app.use('*', (req, res) => {
//     res.status(404).json({ 
//         error: 'Маршрут не знайдено',
//         path: req.originalUrl 
//     });
// });

// // Global error handler
// app.use((error, req, res, next) => {
//     console.error('Server Error:', error);
//     res.status(500).json({ 
//         error: 'Внутрішня помилка сервера',
//         message: error.message 
//     });
// });

// // Запуск сервера
// app.listen(PORT, () => {
//     console.log(`🚀 Сервер запущено на порту ${PORT}`);
//     console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
// });

// module.exports = app;



// import express from "express";
// import cors from "cors";
// import uploadRoutes from "./src/routes/uploadRoutes.js";

// const app = express();
// app.use(cors());
// app.use(express.json());

// // маршрути
// app.use("/api/upload", uploadRoutes);

// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


import express from "express";
import cors from "cors";
import generateRoutes from "./src/routes/generateRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
// import resultsRoutes from "./src/routes/resultsRoutes.js";
// import { router as resultsRoutes } from "./src/routes/resultsRoutes.js";


import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json({ limit: "10mb" })); // розширити при потребі

// тимчасова папка як статична для аудіо/результатів
import path from "path";

import pathModule from "path";
const TEMP_DIR = process.env.TEMP_DIR || pathModule.resolve(process.cwd(), "temp");
app.use("/api/tmp", express.static(TEMP_DIR));

// підключаємо маршрути
app.use("/api/generate", generateRoutes);
app.use("/api/upload", uploadRoutes);
// app.use("/api/results", resultsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));

