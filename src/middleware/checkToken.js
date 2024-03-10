// middleware/checkToken.js
const { verifyToken } = require('../utils/token');

const checkToken = (req, res, next) => {
    const token = req.header('Authorization');

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

    req.userId = decoded.userId;
    next();
};

module.exports = checkToken;
