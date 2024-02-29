const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Добавьте ваши маршруты здесь

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
const projectsRouter = require('./routes/projects');
app.use('/api', projectsRouter);
