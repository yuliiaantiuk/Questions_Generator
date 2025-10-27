// const express = require('express');
// const router = express.Router();

// // POST /api/upload - завантаження текстових даних
// router.post('/', (req, res) => {
//     try {
//         const { text, fileName, fileType } = req.body;
        
//         // Базова валідація
//         if (!text || text.trim().length === 0) {
//             return res.status(400).json({
//                 error: 'Текст обов\'язковий для завантаження'
//             });
//         }

//         // Перевірка обсягу тексту (мінімум 500 слів)
//         const wordCount = text.trim().split(/\s+/).length;
//         if (wordCount < 500) {
//             return res.status(400).json({
//                 error: 'Текст має містити мінімум 500 слів',
//                 currentWords: wordCount
//             });
//         }

//         // Симуляція успішного завантаження
//         const sessionId = require('crypto').randomUUID();
        
//         res.status(200).json({
//             success: true,
//             message: 'Текст успішно завантажено',
//             sessionId: sessionId,
//             wordCount: wordCount,
//             timestamp: new Date().toISOString()
//         });

//     } catch (error) {
//         console.error('Upload error:', error);
//         res.status(500).json({
//             error: 'Помилка при завантаженні тексту',
//             details: error.message
//         });
//     }
// });

// module.exports = router;

import express from "express";
import multer from "multer";
import { handleTextUpload, handleFileUpload } from "../controllers/uploadController.js";

const router = express.Router();

// Налаштування multer для завантаження файлів у тимчасову папку
const upload = multer({ dest: "upload/" });

// Завантаження тексту
router.post("/text", handleTextUpload);

// Завантаження файлу
router.post("/file", upload.single("file"), handleFileUpload);

export default router;
