// routes/alldata.js
const express = require('express');
const router = express.Router();
const { pool, connectDB } = require('../utils/db');
const sql = require('mssql');
const { verifyToken } = require('../utils/token');

// Добавляем обработчик CORS
router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization'); // Добавляем 'Authorization' в заголовки
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

router.get('/', async (req, res) => {
    try {
        // Проверяем, есть ли токен в заголовках запроса
        const token = req.header('Authorization') || req.query.token;

        console.log('Received token:', token);

        if (!token) {
            return res.status(401).send('Access Denied. No token provided.');
        }

        const decoded = verifyToken(token.replace('Bearer ', ''));

        console.log('Decoded token:', decoded);

        if (!decoded) {
            console.log('Invalid token.');
            return res.status(401).send('Invalid token.');
        }

        await connectDB();

        // Получаем список всех таблиц в базе данных
        const tablesResult = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
        const tables = tablesResult.recordset.map(row => row.TABLE_NAME);

        const allData = {};

        // Получаем данные и статистику для каждой таблицы
        for (const tableName of tables) {
            const dataResult = await pool.request().query(`SELECT * FROM ${tableName}`);
            const data = dataResult.recordset;

            const statsResult = await pool.request().query(`SELECT COUNT(*) AS [RowCount] FROM ${tableName}`);
            const rowCount = statsResult.recordset[0].RowCount; // Используем квадратные скобки

            allData[tableName] = { data, rowCount };
        }

        // Отправляем данные клиенту только в случае успешного выполнения
        res.json(allData);
    } catch (error) {
        // Логируем ошибку, но не отправляем ее клиенту в этом блоке
        console.error('Ошибка при получении всех данных из базы данных:', error.message);
        res.status(500).send('Внутренняя ошибка сервера');
    }
});

module.exports = router;
