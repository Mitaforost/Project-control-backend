// auth.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { pool, config } = require('../utils/db');
const { generateToken } = require('../utils/token');

// Middleware для получения уровня доступа пользователя
const getUserAccessLevel = async (req, res, next) => {
    const { username } = req.body;

    console.log('Entering getUserAccessLevel middleware for:', username);

    if (!username) {
        res.status(401).send('Invalid username or password');
        return;
    }

    try {
        const pool = await sql.connect(config);

        console.log('Before access level query');
        const userResult = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT AccessLevel FROM Users WHERE Username = @username');

        const user = userResult.recordset[0];

        if (user) {
            req.userAccessLevel = user.AccessLevel;
            console.log('User access level:', req.userAccessLevel);
            next();
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error('Error getting user access level:', error.message);
        res.status(500).send('Internal Server Error');
    }
};


// Маршрут для авторизации с применением уровней доступа
router.post('/login', getUserAccessLevel, async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Received login request for:', username);
        console.log('Before database connection');
        const pool = await sql.connect(config);

        // Ищем пользователя по имени
        console.log('Before user query');
        const userResult = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE Username = @username');

        const user = userResult.recordset[0];

        // Проверка, найден ли пользователь
        if (!user) {
            res.status(401).send('Invalid username or password');
            return;
        }

        // Проверка пароля с использованием bcrypt
        console.log('Before password validation');
        const isPasswordValid = password === user.Password;
        console.log('Is password valid:', isPasswordValid);
        if (isPasswordValid) {
            const token = generateToken(username, req.userAccessLevel);
            res.json({ token });
            return; // Добавьте этот оператор return
        } else {
            res.status(401).send('Invalid username or password');
        }


        // Генерация токена
        console.log('Before token generation');
        const token = generateToken(
            user.UserID,
            user.Username,
            req.userAccessLevel
        );

        res.json({
            token,
            // Другие данные, которые вы хотите включить в ответ
            employeeID: user.EmployeeID,
            roleID: user.RoleID,
            permissions: getPermissionsByAccessLevel(req.userAccessLevel),
            accessLevel: req.userAccessLevel,
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).send('Internal Server Error');
    } finally {
        await sql.close();
    }
});

// Функция для получения прав доступа на основе уровня доступа
const getPermissionsByAccessLevel = (accessLevel) => {
    // Определите свои правила доступа в зависимости от уровня доступа
    // В данном примере просто возвращаем все права доступа
    if (accessLevel === 1) {
        return ['read', 'write', 'delete', 'update'];
    } else if (accessLevel === 2) {
        return ['read', 'write', 'update'];
    } else if (accessLevel === 3) {
        return ['read'];
    } else {
        return [];
    }
};

module.exports = router;
