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
    },
};



const pool = new sql.ConnectionPool(config);
const connectDB = async () => {
    try {
        await pool.connect();
        console.log('Успешное подключение к базе данных');
    } catch (error) {
        console.error('Ошибка при подключении к базе данных:', error.message);
        throw error; // Добавьте эту строку, чтобы увидеть полный стек трейс ошибки
    }
};


module.exports = { pool, connectDB };
