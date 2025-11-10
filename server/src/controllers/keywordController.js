// server/src/controllers/generateController.js
import { extractKeywords } from "../services/keywordExtractor.js";
import fs from "fs-extra";
import path from "path";

const sessions = global.__SESSIONS__ || (global.__SESSIONS__ = {});

export const saveSessionText = (sessionId, text) => {
  sessions[sessionId] = { text };
};

export const getKeywordsHandler = async (req, res) => {
  try {
    const { sessionId, text } = req.body;

    let sourceText = text;

    if (!sourceText && sessionId) {
      const sess = sessions[sessionId];
      if (!sess) {
        return res.status(404).json({ error: "Session not found" });
      }
      sourceText = sess.text;
    }

    if (!sourceText) {
      return res.status(400).json({ error: "No text provided" });
    }

    const keywords = extractKeywords(sourceText, 30);
    return res.json({ keywords });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
