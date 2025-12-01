import express from 'express';
import ttsService from '../services/ttsService.js';

const router = express.Router();

// Single text synthesis
router.post('/synthesize', async (req, res) => {
  try {
    const { text, language = 'uk' } = req.body;

    if (!text) return res.status(400).json({ error: 'Text is required' });

    const audioBuffer = await ttsService.synthesizeSpeech(text, language);
    res.json({
      success: true,
      audioData: audioBuffer.toString('base64') // return base64
    });

  } catch (error) {
    console.error('TTS route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to synthesize speech'
    });
  }
});

// Batch synthesis for all questions
router.post('/synthesize-batch', async (req, res) => {
  try {
    const { questions, language = 'uk' } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Questions array is required' });
    }

    const audioFiles = await ttsService.synthesizeAllQuestions(questions);
    res.json({
      success: true,
      audioFiles: audioFiles
    });

  } catch (error) {
    console.error('Batch TTS error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to synthesize batch'
    });
  }
});

export default router;

