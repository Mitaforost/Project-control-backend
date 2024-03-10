// routes/documents.js
const express = require('express');
const router = express.Router();
const DocumentService = require('../services/DocumentService');
const checkToken = require('../middleware/checkToken');
const checkAccessLevel = require('../middleware/checkAccessLevel'); // Добавляем middleware для проверки уровня доступа

router.use(checkToken); // Применяем проверку токена ко всем эндпоинтам

// Получить все документы
router.get('/api/documents', checkAccessLevel(1), async (req, res) => {
    try {
        const documents = await DocumentService.getDocuments();
        res.json(documents);
    } catch (error) {
        console.error('Error handling documents request:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Получить документы для конкретного пользователя
router.get('/api/documents/:userID', checkAccessLevel(1), async (req, res) => {
    const userID = req.params.userID;

    try {
        const documents = await DocumentService.getDocumentsByUser(userID);
        res.json(documents);
    } catch (error) {
        console.error('Error handling documents request:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Создать новый документ
router.post('/api/documents', checkAccessLevel(2), async (req, res) => {
    const newDocument = req.body;

    try {
        const createdDocument = await DocumentService.createDocument(newDocument);
        res.status(201).json(createdDocument);
    } catch (error) {
        console.error('Error creating a new document:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Подписать документ
router.put('/api/documents/:documentID/sign', checkAccessLevel(2), async (req, res) => {
    const documentID = req.params.documentID;

    try {
        const signedDocument = await DocumentService.signDocument(documentID);
        res.json(signedDocument);
    } catch (error) {
        console.error('Error handling sign document request:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Обновить статус документа
router.put('/api/documents/:documentID/status', checkAccessLevel(2), async (req, res) => {
    const documentID = req.params.documentID;
    const newStatus = req.body.newStatus;

    try {
        const updatedDocument = await DocumentService.updateDocumentStatus(documentID, newStatus);
        res.status(200).json(updatedDocument);
    } catch (error) {
        console.error('Error updating document status:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Удалить документ
router.delete('/api/documents/:documentID', checkAccessLevel(2), async (req, res) => {
    const documentID = req.params.documentID;

    try {
        await DocumentService.deleteDocument(documentID);
        res.status(204).send(); // No Content
    } catch (error) {
        console.error('Error deleting document:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
