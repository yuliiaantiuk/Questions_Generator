import express from "express";
import { updateSessionActivity } from "../utils/sessionManager.js";
import { getSession } from "../utils/sessionManager.js";
import fs from "fs";

const router = express.Router();
// Ping to keep session active
router.post("/ping/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  updateSessionActivity(sessionId);
  res.status(200).json({ message: "Сесія активна" });
});
// Check if session exists
router.get("/check/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: "Сесія не знайдена" });
    }

    // Check if file exists
    if (session.filePath && !fs.existsSync(session.filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({ success: true, sessionExists: true });
  } catch (error) {
    console.error("Session check error:", error);
    res.status(500).json({ error: "Session check error" });
  }
});

export default router;
