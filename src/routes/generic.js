// routes/generic.js
const express = require('express');
const GenericService = require('../services/GenericService');

const createGenericRouter = (tableName) => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        try {
            const { page = 1, pageSize = 10 } = req.query;
            const data = await GenericService.getData(tableName, page, pageSize);
            res.json(data);
        } catch (error) {
            console.error(`Error handling generic data request for ${tableName}:`, error.message);
            res.status(500).send('Internal Server Error');
        }
    });

    router.get('/count', async (req, res) => {
        try {
            const dataCount = await GenericService.getDataCount(tableName);
            res.json({ dataCount });
        } catch (error) {
            console.error(`Error handling generic data count request for ${tableName}:`, error.message);
            res.status(500).send('Internal Server Error');
        }
    });

    return router;
};

module.exports = createGenericRouter;
