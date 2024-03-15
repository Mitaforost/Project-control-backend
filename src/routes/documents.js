// routes/documents.js
const express = require('express');
const router = express.Router();
const DocumentService = require('../services/DocumentService');
const checkToken = require('../middleware/checkToken');
const checkAccessLevel = require('../middleware/checkAccessLevel'); // Добавляем middleware для проверки уровня доступа

router.use(checkToken); // Применяем проверку токена ко всем эндпоинтам

// Получить все документы
router.get('/api/documents', checkAccessLevel(1), async (req, res) => {
    console.log('Уровень доступа пользователя:', req.userAccessLevel); // Добавлено для отладки
    try {
        const documents = await DocumentService.getDocuments();
        res.json(documents);
    } catch (error) {
        console.error('Ошибка обработки запроса документов:', error.message);
        res.status(500).send('Внутренняя ошибка сервера');
    }
});

// Получить документы для конкретного пользователя
router.get('/api/documents/:userID', checkAccessLevel(1), async (req, res) => {
    const userID = req.params.userID;

    try {
        const documents = await DocumentService.getDocumentsByUser(userID);
        res.json(documents);
    } catch (error) {
        console.error('Ошибка обработки запроса документов:', error.message);
        res.status(500).send('Внутренняя ошибка сервера');
    }
});

// Создать новый документ
router.post('/api/documents', checkAccessLevel(2), async (req, res) => {
    const newDocument = req.body;
    try {
        const createdDocument = await DocumentService.createDocument(newDocument);
        res.status(201).json(createdDocument);
    } catch (error) {
        console.error('Ошибка создания нового документа:', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Подписать документ (только для уровня доступа 1)
router.put('/api/documents/:documentID/sign', checkAccessLevel(1), async (req, res) => {
    const documentID = req.params.documentID;
    const newStatus = req.body.newStatus;
    const userAccessLevel = req.userAccessLevel;

    try {
        console.log('Запрос на обновление статуса документа:', documentID, newStatus, userAccessLevel);
        const updatedDocument = await DocumentService.signDocument(documentID, req.userAccessLevel, parseInt(req.userId));
        res.status(200).json(updatedDocument);
    } catch (error) {
        console.error('Ошибка обновления статуса документа:', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

router.put('/api/documents/:documentID/status', checkAccessLevel(2), async (req, res) => {
    const documentID = req.params.documentID;
    const newStatus = req.body.newStatus;
    const userAccessLevel = req.userAccessLevel;

    try {
        console.log('Запрос на обновление статуса документа:', documentID, newStatus, userAccessLevel);
        const updatedDocument = await DocumentService.updateDocumentStatus(documentID, newStatus, req.userAccessLevel, parseInt(req.userId));
        res.status(200).json(updatedDocument);
    } catch (error) {
        console.error('Ошибка обновления статуса документа:', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Удалить документ
router.delete('/api/documents/:documentID', checkAccessLevel(2), async (req, res) => {
    const documentID = req.params.documentID;

    try {
        await DocumentService.deleteDocument(documentID);
        res.status(204).send(); // No Content
    } catch (error) {
        console.error('Ошибка удаления документа:', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});
router.put('/api/documents/:documentID/send-for-signing', checkAccessLevel(1), async (req, res) => {
    const documentID = req.params.documentID;

    try {
        const sentDocument = await DocumentService.sendDocumentForSigning(documentID, req.userId);
        res.json(sentDocument);
    } catch (error) {
        console.error('Ошибка обработки отправки документа для запроса на подпись:', error.message);

        if (error.message === 'Неверный статус документа для отправки на подпись') {
            res.status(400).json({ error: 'Невозможно отправить документ на подпись с текущим статусом' });
        } else {
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
});
// Подписать документ (только для уровня доступа 1)
router.put('/api/documents/:documentID/sign', checkAccessLevel(1), async (req, res) => {
    const documentID = req.params.documentID;
    const newStatus = req.body.newStatus;
    const userAccessLevel = req.userAccessLevel;

    try {
        console.log('Запрос на обновление статуса документа:', documentID, newStatus, userAccessLevel);
        const updatedDocument = await DocumentService.sendDocumentForSigning(documentID, newStatus, req.userAccessLevel, parseInt(req.userId));
        res.status(200).json(updatedDocument);
    } catch (error) {
        console.error('Ошибка обновления статуса документа.:', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router;