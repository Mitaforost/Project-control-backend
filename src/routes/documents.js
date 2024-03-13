// routes/documents.js
const express = require('express');
const router = express.Router();
const DocumentService = require('../services/DocumentService');
const checkToken = require('../middleware/checkToken');
const checkAccessLevel = require('../middleware/checkAccessLevel'); // Добавляем middleware для проверки уровня доступа

router.use(checkToken); // Применяем проверку токена ко всем эндпоинтам

// Получить все документы
router.get('/api/documents', checkAccessLevel(1), async (req, res) => {
    console.log('User Access Level:', req.userAccessLevel); // Добавлено для отладки
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

// Подписать документ (только для уровня доступа 1)
router.put('/api/documents/:documentID/sign', checkAccessLevel(1), async (req, res) => {
    const documentID = req.params.documentID;
    const signedByUserID = req.userId; // Используем userId

    try {
        const signedDocument = await DocumentService.signDocument(documentID, signedByUserID);
        res.json(signedDocument);
    } catch (error) {
        console.error('Error handling sign document request:', error.message);

        if (error.message === 'Invalid document status for signing') {
            res.status(400).json({ error: 'Невозможно подписать документ с текущим статусом' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

router.put('/api/documents/:documentID/status', checkAccessLevel(1), async (req, res) => {
    const documentID = req.params.documentID;
    const newStatus = req.body.newStatus;
    const userAccessLevel = req.userAccessLevel;

    try {
        console.log('Request to update document status:', documentID, newStatus, userAccessLevel);
        const updatedDocument = await DocumentService.updateDocumentStatus(documentID, newStatus, req.userId);
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
router.put('/api/documents/:documentID/send-for-signing', checkAccessLevel(2), async (req, res) => {
    const documentID = req.params.documentID;

    try {
        const sentDocument = await DocumentService.sendDocumentForSigning(documentID, req.userId);
        res.json(sentDocument);
    } catch (error) {
        console.error('Error handling send document for signing request:', error.message);

        if (error.message === 'Invalid document status for sending for signing') {
            res.status(400).json({ error: 'Невозможно отправить документ на подпись с текущим статусом' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});
module.exports = router;
