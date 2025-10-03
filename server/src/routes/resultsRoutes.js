const express = require('express');
const router = express.Router();

// GET /api/results/:id - отримання результатів
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        // Приклад відповіді з тестовими даними
        const mockQuestions = {
            sessionId: id,
            questions: [
                {
                    id: '1',
                    type: 'single',
                    question: 'Що таке JavaScript?',
                    options: ['Мова програмування', 'Вид кави', 'Ім\'я людини'],
                    correctAnswer: 'Мова програмування'
                },
                {
                    id: '2', 
                    type: 'multiple',
                    question: 'Які з переліченого є типами даних в JavaScript?',
                    options: ['String', 'Integer', 'Boolean', 'Array'],
                    correctAnswer: ['String', 'Boolean', 'Array']
                }
            ],
            generatedAt: new Date().toISOString(),
            wordCount: 1500
        };

        res.status(200).json(mockQuestions);

    } catch (error) {
        console.error('Results error:', error);
        res.status(500).json({
            error: 'Помилка при отриманні результатів',
            details: error.message
        });
    }
});

module.exports = router;