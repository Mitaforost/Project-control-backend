// services/ProjectService.js
const { pool, connectDB } = require('../utils/db');
const sql = require('mssql');

class ProjectService {
    static async getProjects(page = 1, pageSize = 10) {
        try {
            await connectDB();

            const offset = (page - 1) * pageSize;

            const result = await pool
                .request()
                .input('offset', sql.Int, offset)
                .input('pageSize', sql.Int, pageSize)
                .query('SELECT * FROM Projects ORDER BY ProjectID OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY');

            const projects = result.recordset;
            console.log('SQL Query Result:', projects);

            return projects;
        } catch (error) {
            console.error('Error fetching projects from the database:', error.message);
            throw error;
        }
    }

    static async getProjectsCount() {
        try {
            await connectDB();

            const result = await pool.request().query('SELECT COUNT(*) AS projectCount FROM Projects');

            return result.recordset[0].projectCount;
        } catch (error) {
            console.error('Error fetching projects count from the database:', error.message);
            throw error;
        }
    }
    static async getProjectById(projectId) {
        try {
            await connectDB();

            const result = await pool
                .request()
                .input('projectId', sql.Int, projectId)
                .query('SELECT * FROM Projects WHERE ProjectID = @projectId');

            const project = result.recordset[0];
            console.log('SQL Query Result for getProjectById:', project);

            return project;
        } catch (error) {
            console.error('Error fetching project by ID from the database:', error.message);
            throw error;
        }
    }

    static async editProject(projectId, updatedProjectData) {
        try {
            await connectDB();

            const result = await pool
                .request()
                .input('projectId', sql.Int, projectId)
                .input('projectName', sql.NVarChar, updatedProjectData.ProjectName)
                .input('projectDescription', sql.NVarChar, updatedProjectData.ProjectDescription)
                // Добавьте другие поля проекта, которые вы хотите редактировать
                .query(`
                    UPDATE Projects
                    SET ProjectName = @projectName, ProjectDescription = @projectDescription
                    WHERE ProjectID = @projectId
                `);

            console.log('SQL Query Result for editProject:', result);

            // Возвращаем обновленные данные проекта (может быть необходимо вызвать getProjectById для получения актуальных данных)
            return updatedProjectData;
        } catch (error) {
            console.error('Error editing project in the database:', error.message);
            throw error;
        }
    }
    static async createProject(newProject) {
        try {
            await connectDB();

            const result = await pool
                .request()
                .input('projectName', sql.NVarChar, newProject.ProjectName)
                .input('projectDescription', sql.NVarChar, newProject.ProjectDescription)
                .query('INSERT INTO Projects (ProjectName, ProjectDescription) VALUES (@projectName, @projectDescription); SELECT * FROM Projects WHERE ProjectID = SCOPE_IDENTITY();');

            return result.recordset[0];
        } catch (error) {
            console.error('Error creating project in the database:', error.message);
            throw error;
        }
    }
    static async deleteProject(projectId) {
        try {
            await connectDB();
            await pool
                .request()
                .input('projectId', sql.Int, projectId)
                .query('DELETE FROM Projects WHERE ProjectID = @projectId');
        } catch (error) {
            console.error('Error deleting project in the database:', error.message);
            throw error;
        }
    }

}

module.exports = ProjectService;
