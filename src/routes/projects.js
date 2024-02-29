const express = require('express');
const router = express.Router();
const { pool, connectDB } = require('../utils/db');

// Эндпоинт для получения данных из базы
router.get('/projects', async (req, res) => {
    try {
        await connectDB(); // Подключаемся к базе данных
        const result = await pool.request().query('SELECT * FROM EmployeeDemographics');
        console.log(result.recordset);
        res.json(result.recordset);
    } catch (error) {
        console.error('Ошибка при получении данных из базы данных:', error.message);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;
