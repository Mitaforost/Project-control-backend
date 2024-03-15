// middleware/checkAccessLevel.js
const checkAccessLevel = (requiredAccessLevel) => {
    return (req, res, next) => {
        // Проверка уровня доступа пользователя
        console.log('Требуемый уровень доступа:', requiredAccessLevel);
        console.log('Уровень доступа пользователя:', req.userAccessLevel);

        if (req.userAccessLevel && req.userAccessLevel >= requiredAccessLevel) {
            console.log('Доступ предоставлен. Переход к следующему промежуточному программному обеспечению или маршруту.');
            next(); // Пользователь имеет достаточный уровень доступа
        } else {
            console.log('Доступ запрещен. Отправка 403 Запрещенный ответ.');
            res.status(403).send('Доступ запрещен');
        }
    };
};

module.exports = checkAccessLevel;
