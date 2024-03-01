const express = require('express');
const router = express.Router();
const { pool, connectDB, createConfig } = require('../utils/db');

// Эндпоинт для получения данных из базы
router.get('/api/projects', async (req, res) => {
    try {
        await connectDB();
        const result = await pool.request().query('SELECT * FROM Projects');
        console.log('SQL Query Result:', result.recordset); // Log the SQL query result for debugging
        res.json(result.recordset);
    } catch (error) {
        console.error('Ошибка при получении данных из базы данных:', error.message);
        res.status(500).send('Ошибка сервера');
    }
});


module.exports = router;
