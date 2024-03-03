// routers/alldata.js
const express = require('express');
const router = express.Router();
const { pool, connectDB } = require('../utils/db');
const sql = require('mssql');

router.get('/alldata', async (req, res) => {
    try {
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

        res.json(allData);
    } catch (error) {
        console.error('Ошибка при получении всех данных из базы данных:', error.message);
        res.status(500).send('Внутренняя ошибка сервера');
    }
});

module.exports = router;
