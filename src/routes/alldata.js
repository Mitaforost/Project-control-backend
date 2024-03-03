// routers/alldata.js
const express = require('express');
const router = express.Router();
const { pool, connectDB } = require('../utils/db');
const sql = require('mssql');

router.get('/alldata', async (req, res) => {
    try {
        await connectDB();

        const projectsResult = await pool.request().query('SELECT * FROM Projects');
        const employeesResult = await pool.request().query('SELECT * FROM Employees');

        const projects = projectsResult.recordset;
        const employees = employeesResult.recordset;

        const allData = { projects, employees };

        res.json(allData);
    } catch (error) {
        console.error('Error fetching all data from the database:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
