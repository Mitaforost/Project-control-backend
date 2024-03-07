// routes/documents.js
const express = require('express');
const router = express.Router();
const DocumentService = require('../services/DocumentService');

router.get('/api/documents', async (req, res) => {
    try {
        const documents = await DocumentService.getDocuments();
        res.json(documents);
    } catch (error) {
        console.error('Error handling documents request:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/api/documents/:userID', async (req, res) => {
    const userID = req.params.userID;

    try {
        const documents = await DocumentService.getDocumentsByUser(userID);
        res.json(documents);
    } catch (error) {
        console.error('Error handling documents request:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/api/documents', async (req, res) => {
    const newDocument = req.body;

    try {
        const createdDocument = await DocumentService.createDocument(newDocument);
        res.status(201).json(createdDocument);
    } catch (error) {
        console.error('Error creating a new document:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/api/documents/:documentID/sign', async (req, res) => {
    const documentID = req.params.documentID;

    try {
        const signedDocument = await DocumentService.signDocument(documentID);
        res.json(signedDocument);
    } catch (error) {
        console.error('Error handling sign document request:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

router.put('/api/documents/:documentID/status', async (req, res) => {
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

module.exports = router;
