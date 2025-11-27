import express from "express";
import { updateSessionActivity } from "../utils/sessionManager.js";
import { getSession } from "../utils/sessionManager.js";
import fs from "fs";

const router = express.Router();

router.post("/ping/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  updateSessionActivity(sessionId);
  res.status(200).json({ message: "Сесія активна" });
});

router.get("/check/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: "Сесія не знайдена" });
    }

    // Перевіряємо чи файл існує
    if (session.filePath && !fs.existsSync(session.filePath)) {
      return res.status(404).json({ error: "Файл не знайдений" });
    }

    res.json({ success: true, sessionExists: true });
  } catch (error) {
    console.error("Помилка перевірки сесії:", error);
    res.status(500).json({ error: "Помилка перевірки сесії" });
  }
});

export default router;
