const sql = require('mssql');

const config = {
    server: 'DESKTOP-S9EG4AG',
    database: 'projectsDB',
    authentication: {
        type: 'default',
        options: {
            userName: 'Danila',
            password: '3777',
        },
    },
    options: {
        encrypt: true,
        trustServerCertificate: true,
        port: 1433,
    },
};

const pool = new sql.ConnectionPool(config);

const connectDB = async (username, password) => {
    try {
        if (!pool.connected) {
            // Обновляем данные в config перед подключением
            config.authentication.options.userName = username;
            config.authentication.options.password = password;

            await pool.connect();
            console.log('Успешное подключение к базе данных');
        } else {
            console.log('Соединение с базой данных уже установлено');
        }
    } catch (error) {
        console.error('Ошибка при подключении к базе данных:', error.message);
        throw error;
    }
};

module.exports = { pool, connectDB, config };