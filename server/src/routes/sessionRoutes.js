import express from "express";
import { updateSessionActivity } from "../utils/sessionManager.js";

const router = express.Router();

router.post("/ping/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  updateSessionActivity(sessionId);
  res.status(200).json({ message: "Сесія активна" });
});

export default router;
