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
        res.json({projectsCount});
    } catch (error) {
        console.error('Error handling projects count request:', error.message);
        res.status(500).send('Internal Server Error');
    }
});
router.put('/api/projects/:id', async (req, res) => {
    const projectId = req.params.id;
    const updatedProjectData = req.body;

    try {
        // Проверяем наличие проекта с указанным ID перед редактированием
        const existingProject = await ProjectService.getProjectById(projectId);

        if (!existingProject) {
            // Если проект не найден, возвращаем ошибку 404
            return res.status(404).json({error: 'Project not found'});
        }

        // Вызываем метод для редактирования проекта в сервисе
        const updatedProject = await ProjectService.editProject(projectId, updatedProjectData);

        // Возвращаем отредактированный проект
        res.json(updatedProject);
    } catch (error) {
        console.error('Error handling project edit request:', error.message);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/api/projects', async (req, res) => {
    try {
        const newProject = req.body; // Получаем данные нового проекта из тела запроса
        const createdProject = await ProjectService.createProject(newProject);
        res.status(201).json(createdProject);
    } catch (error) {
        console.error('Error handling create project request:', error.message);
        res.status(500).send('Internal Server Error');
    }
});
router.delete('/api/projects/:id', async (req, res) => {
    const projectId = req.params.id;

    try {
        // Проверяем наличие проекта с указанным ID перед удалением
        const existingProject = await ProjectService.getProjectById(projectId);

        if (!existingProject) {
            // Если проект не найден, возвращаем ошибку 404
            return res.status(404).json({error: 'Project not found'});
        }

        // Вызываем метод для удаления проекта в сервисе
        await ProjectService.deleteProject(projectId);

        // Возвращаем успешный статус
        res.sendStatus(204);
    } catch (error) {
        console.error('Error handling project delete request:', error.message);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
