// utils/token.js
const jwt = require('jsonwebtoken');

// Проверяем, есть ли у нас секретный ключ в переменной окружения
const secretKey = process.env.JWT_SECRET_KEY || 'DefaultSecretKey';

const generateToken = (userId, username, accessLevel) => {
    const payload = { userId, username, accessLevel };
    return jwt.sign(payload, secretKey);
};


const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (error) {
        return null;
    }
};

module.exports = { generateToken, verifyToken };
