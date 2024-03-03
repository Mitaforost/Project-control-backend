// routes/projects.js
const express = require('express');
const router = express.Router();
const ProjectService = require('../services/ProjectService');

router.get('/api/projects', async (req, res) => { // измените путь здесь
    try {
        const projects = await ProjectService.getProjects();
        res.json(projects);
    } catch (error) {
        console.error('Error handling projects request:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/api/projects/count', async (req, res) => {
    try {
        const projectsCount = await ProjectService.getProjectsCount();
        res.json({ projectsCount });
    } catch (error) {
        console.error('Error handling projects count request:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
