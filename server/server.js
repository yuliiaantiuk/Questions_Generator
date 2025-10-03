const express = require('express');
const cors = require('cors');
const path = require('path');

// Імпорт маршрутів
const uploadRoutes = require('./src/routes/uploadRoutes');
const generateRoutes = require('./src/routes/generateRoutes');
const resultsRoutes = require('./src/routes/resultsRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Базовий маршрут для перевірки
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Сервер працює коректно',
        timestamp: new Date().toISOString()
    });
});

// Підключення маршрутів
app.use('/api/upload', uploadRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/results', resultsRoutes);

// Обробка незнайдених маршрутів
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Маршрут не знайдено',
        path: req.originalUrl 
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({ 
        error: 'Внутрішня помилка сервера',
        message: error.message 
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на порту ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;