import fs from "fs-extra";
import path from "path";
import { getJob, updateJob } from "./jobManager.js";
import { hfGenerateText } from "./hfService.js"; // твоя обгортка для HF
import { extractTextFromPath } from "./textExtractor.js";

const TEMP_DIR = path.resolve(process.cwd(), "temp");

function splitTextToChunks(text, approxWordsPerChunk = 1500) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += approxWordsPerChunk) {
    chunks.push(words.slice(i, i + approxWordsPerChunk).join(" "));
  }
  return chunks;
}

export async function processJob(jobId) {
  const job = getJob(jobId);
  if (!job) throw new Error("Job not found");

  updateJob(jobId, { status: "running", progress: 0 });
  try {
    const fileCandidates = await fs.readdir(TEMP_DIR);
    const matching = fileCandidates.find(f => f.startsWith(job.sessionId));
    if (!matching) throw new Error("No file for this session");

    const filePath = path.join(TEMP_DIR, matching);
    const text = await extractTextFromPath(filePath);

    const chunks = splitTextToChunks(text, 1200); // налаштуй
    const total = chunks.length;
    let accumulatedQuestions = [];

    for (let i = 0; i < total; i++) {
      const nowJob = getJob(jobId);
      if (!nowJob) throw new Error("Job removed");
      if (nowJob.control.cancel) {
        updateJob(jobId, { status: "cancelled", progress: Math.round((i/total)*100) });
        return;
      }
      // Якщо пауза — чекати, поки pause стане false
      while (nowJob.control.pause) {
        updateJob(jobId, { status: "paused" });
        // невеликий sleep
        await new Promise(r => setTimeout(r, 1000));
        nowJob = getJob(jobId);
        if (!nowJob) throw new Error("Job removed during pause");
        if (nowJob.control.cancel) {
          updateJob(jobId, { status: "cancelled", progress: Math.round((i/total)*100) });
          return;
        }
      }
      updateJob(jobId, { status: "running" });

      // формуємо prompt — попросимо повернути JSON масив
      const prompt = `
You are to generate test questions (different types) based on the following text chunk.
Difficulty: ${job.params.difficulty}
Focus keywords: ${ (job.params.selectedKeywords || []).join(", ") || "main topics" }

Please return result as JSON array of objects. Each object:
{
  "type": "singleChoice" | "multipleChoice" | "trueFalse" | "shortAnswer",
  "text": "question text",
  "options": ["opt1","opt2",...], // only for single/multiple
  "correct": [0] or [0,2] or true/false, // index(es) or boolean
  "explanation": "optional short explanation"
}

Text chunk:
"""${chunks[i]}"""
Limit to maximum 5 questions for this chunk.
`;

      // виклик HF (твоя обгортка повинна повертати string або JS object)
      const hfResult = await hfGenerateText(process.env.HF_TEXT_MODEL || "google/flan-t5-large", prompt, { maxTokens: 512, temperature: 0.1 });

      // спробуй розпарсити відповідь як JSON
      let parsed = [];
      try {
        parsed = typeof hfResult === "string" ? JSON.parse(hfResult) : hfResult;
        if (!Array.isArray(parsed)) throw new Error("Not array");
      } catch (e) {
        // якщо відповів невалідним JSON — можна спробувати взяти JSON із тексту (regex) або логувати помилку
        console.error("Failed to parse HF output for job", jobId, e);
        // як fallback — пропустити цей chunk
        parsed = [];
      }

      // агрегація + просте dedupe (за текстом)
      for (const q of parsed) {
        if (!accumulatedQuestions.some(existing => existing.text === q.text)) {
          accumulatedQuestions.push(q);
        }
      }

      // оновлення прогресу
      const progress = Math.round(((i + 1) / total) * 90); // 90% — генерація, 10% — фіналізація
      updateJob(jobId, { progress, result: accumulatedQuestions });
    }

    // фіналізація — можлива постобробка: валідація, нормалізація типів, shuffle options
    // збереження результату у файл
    const outPath = path.join(TEMP_DIR, `${job.sessionId}_result.json`);
    await fs.writeFile(outPath, JSON.stringify({ questions: accumulatedQuestions }, null, 2), "utf8");

    // якщо потрібно генерувати аудіо — окремим кроком тут
    // updateJob(jobId, { progress: 95 });

    updateJob(jobId, { progress: 100, status: "completed", resultPath: outPath, result: accumulatedQuestions });
    return;
  } catch (err) {
    console.error("Job failed:", err);
    updateJob(jobId, { status: "failed", error: String(err) });
    throw err;
  }
}
