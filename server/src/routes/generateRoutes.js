// const express = require('express');
// const router = express.Router();

// // POST /api/generate - генерація питань
// router.post('/', async (req, res) => {
//     try {
//         const { sessionId, settings } = req.body;
        
//         if (!sessionId) {
//             return res.status(400).json({
//                 error: 'sessionId обов\'язковий'
//             });
//         }

//         // Симуляція процесу генерації
//         const generationId = require('crypto').randomUUID();
        
//         res.status(202).json({
//             success: true,
//             message: 'Генерація питань розпочата',
//             generationId: generationId,
//             sessionId: sessionId,
//             status: 'in_progress',
//             estimatedTime: '2-3 хвилини'
//         });

//     } catch (error) {
//         console.error('Generation error:', error);
//         res.status(500).json({
//             error: 'Помилка при генерації питань',
//             details: error.message
//         });
//     }
// });

// module.exports = router;

import express from "express";
import path from "path";
import fs from "fs-extra";
import { extractTextFromPath } from "../services/textExtractor.js";
import { extractKeywords } from "../services/nlpService.js";
import { hfGenerateText, hfTextToSpeech } from "../services/hfService.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const TEMP_DIR = process.env.TEMP_DIR || path.resolve(process.cwd(), "temp");
const HF_MODEL = process.env.HF_TEXT_MODEL || "google/flan-t5-large";
const HF_TTS_MODEL = process.env.HF_TTS_MODEL || null; // якщо null — не робимо TTS через HF

// POST /api/generate/keywords  { sessionId }
router.post("/keywords", async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    // знаходимо файл у TMP (припускаємо, що файли збережені як sessionId + ext)
    const files = await fs.readdir(TEMP_DIR);
    const matching = files.find(f => f.startsWith(sessionId));
    if (!matching) return res.status(404).json({ error: "No file for this session" });

    const filePath = path.join(TEMP_DIR, matching);
    const text = await extractTextFromPath(filePath);
    const keywords = extractKeywords(text, 20);

    res.json({ keywords });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/generate  { sessionId, difficulty, selectedKeywords: [], withAudio: boolean, showAnswers: boolean }
router.post("/", async (req, res) => {
  try {
    const { sessionId, difficulty = "medium", selectedKeywords = [], withAudio = false, showAnswers = false } = req.body;

    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    const files = await fs.readdir(TEMP_DIR);
    const matching = files.find(f => f.startsWith(sessionId));
    if (!matching) return res.status(404).json({ error: "No file for this session" });

    const filePath = path.join(TEMP_DIR, matching);
    const text = await extractTextFromPath(filePath);

    // Формуємо prompt, включаємо ключові слова та складність
    const keywordsStr = (selectedKeywords && selectedKeywords.length) ? selectedKeywords.join(", ") : "the main topics";
    const prompt = `
Generate a set of test questions based on the following text.
Difficulty level: ${difficulty}.
Focus on key concepts: ${keywordsStr}.
${showAnswers ? "Include correct answers after each question." : ""}
Text:
"""${text}"""
Provide output as numbered questions.`;
    // виклик HF
    const generated = await hfGenerateText(HF_MODEL, prompt, { maxTokens: 400, temperature: 0.1 });

    // збережемо результат у файлі JSON тимчасово
    const outJsonPath = path.join(TEMP_DIR, `${sessionId}_result.json`);
    await fs.writeFile(outJsonPath, JSON.stringify({ generated }, null, 2), "utf8");

    let audioPath = null;
    if (withAudio && HF_TTS_MODEL) {
      // згенеруємо аудіо з текстом питань (генерація аудіо може бути великою — можливо, треба розбити)
      const outFile = path.join(TEMP_DIR, `${sessionId}_questions.mp3`);
      audioPath = await hfTextToSpeech(HF_TTS_MODEL, generated, outFile);
    }

    // повертаємо результат (генерація як текст)
    res.json({ success: true, generated, audioPath: audioPath ? `/api/tmp/${path.basename(audioPath)}` : null });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
