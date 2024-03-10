// middleware/checkAccessLevel.js
const checkAccessLevel = (requiredAccessLevel) => {
    return (req, res, next) => {
        // Проверка уровня доступа пользователя
        console.log('Required Access Level:', requiredAccessLevel);
        console.log('User Access Level:', req.userAccessLevel);

        if (req.userAccessLevel && req.userAccessLevel >= requiredAccessLevel) {
            console.log('Access granted. Proceeding to the next middleware or route.');
            next(); // Пользователь имеет достаточный уровень доступа
        } else {
            console.log('Access denied. Sending 403 Forbidden response.');
            res.status(403).send('Access Forbidden'); // Доступ запрещен
        }
    };
};

module.exports = checkAccessLevel;
