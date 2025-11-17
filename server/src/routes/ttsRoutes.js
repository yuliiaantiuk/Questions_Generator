import express from 'express';
import ttsService from '../services/ttsService.js';
import path from 'path';
import fs from 'fs-extra';

const router = express.Router();

// Синтез мови для одного тексту
router.post('/synthesize', async (req, res) => {
  try {
    const { text, language = 'uk' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const filename = await ttsService.synthesizeSpeech(text, language);
    res.json({ 
      success: true, 
      filename: filename,
      url: `/api/tts/audio/${filename}`
    });
  } catch (error) {
    console.error('TTS route error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to synthesize speech' 
    });
  }
});

// Масовий синтез для всіх запитань
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

// Отримання аудіофайлу
router.get('/audio/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = ttsService.getAudioPath(filename);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'Audio file not found' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Audio file error:', error);
    res.status(500).json({ error: 'Failed to get audio file' });
  }
});

// Очищення аудіофайлів (опціонально)
router.delete('/cleanup', async (req, res) => {
  try {
    await ttsService.cleanOldAudioFiles();
    res.json({ success: true, message: 'Old audio files cleaned up' });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ success: false, error: 'Cleanup failed' });
  }
});

router.get('/audio/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = ttsService.getAudioPath(filename);
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'Audio file not found' });
    }
    res.setHeader('Content-Type', 'audio/mpeg');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Audio file error:', error);
    res.status(500).json({ error: 'Failed to get audio file' });
  }
});


export default router;