const express = require('express');
const router = express.Router();

// POST /api/generate - генерація питань
router.post('/', async (req, res) => {
    try {
        const { sessionId, settings } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({
                error: 'sessionId обов\'язковий'
            });
        }

        // Симуляція процесу генерації
        const generationId = require('crypto').randomUUID();
        
        res.status(202).json({
            success: true,
            message: 'Генерація питань розпочата',
            generationId: generationId,
            sessionId: sessionId,
            status: 'in_progress',
            estimatedTime: '2-3 хвилини'
        });

    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({
            error: 'Помилка при генерації питань',
            details: error.message
        });
    }
});

module.exports = router;