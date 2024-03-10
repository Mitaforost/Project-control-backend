//server.js
const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const genericRouter = require('./routes/generic');
const alldataRouter = require('./routes/alldata');
const projectsRouter = require('./routes/projects');
const documentsRouter = require('./routes/documents');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/projects', genericRouter('Projects'));
app.use('/users', genericRouter('Users'));
app.use('/', documentsRouter);  // Изменено: используйте '/' вместо '/documents'
app.use(alldataRouter);
app.use(projectsRouter);

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
