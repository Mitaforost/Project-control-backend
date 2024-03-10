// routes/users.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { pool, config } = require('../utils/db');

// Эндпоинт для получения данных всех пользователей
router.get('/users', async (req, res) => {
    try {
        await pool.connect();
        const result = await pool.request().query('SELECT * FROM Users');
        console.log('SQL Query Result:', result.recordset);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching data from the database:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Эндпоинт для создания нового пользователя
router.post('/users', async (req, res) => {
    const { username, password, accessLevel } = req.body;

    try {
        // Проверка существования пользователя
        const existingUserResult = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE Username = @username');

        const existingUser = existingUserResult.recordset[0];

        if (existingUser) {
            res.status(400).send('User already exists');
            return;
        }

        // Хеширование пароля с использованием bcrypt
        const hashedPassword = password;

        // Вставка нового пользователя с хешированным паролем
        const insertUserResult = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .input('accessLevel', sql.Int, accessLevel)
            .query('INSERT INTO Users (Username, Password, AccessLevel) VALUES (@username, @password, @accessLevel)');

        console.log('New user added:', insertUserResult);

        res.status(201).send('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Получение всех ролей
router.get('/roles', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Roles');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching roles from the database:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Назначение роли пользователю
router.post('/assign-role', async (req, res) => {
    const { userID, roleID } = req.body;

    try {
        // Проверка существования пользователя и роли
        const userResult = await pool.request()
            .input('userID', sql.Int, userID)
            .query('SELECT * FROM Users WHERE UserID = @userID');

        const roleResult = await pool.request()
            .input('roleID', sql.Int, roleID)
            .query('SELECT * FROM Roles WHERE RoleID = @roleID');

        if (!userResult.recordset[0] || !roleResult.recordset[0]) {
            res.status(400).send('Invalid user or role');
            return;
        }

        // Проверка, уже ли назначена роль пользователю
        const existingAssignmentResult = await pool.request()
            .input('userID', sql.Int, userID)
            .input('roleID', sql.Int, roleID)
            .query('SELECT * FROM UsersRoles WHERE UserID = @userID AND RoleID = @roleID');

        const existingAssignment = existingAssignmentResult.recordset[0];

        if (existingAssignment) {
            res.status(400).send('Role already assigned to the user');
            return;
        }

        // Назначение роли пользователю
        await pool.request()
            .input('userID', sql.Int, userID)
            .input('roleID', sql.Int, roleID)
            .query('INSERT INTO UsersRoles (UserID, RoleID) VALUES (@userID, @roleID)');

        res.status(201).send('Role assigned successfully');
    } catch (error) {
        console.error('Error assigning role to user:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Другие эндпоинты и функции для управления пользователями могут быть добавлены здесь

module.exports = router;
