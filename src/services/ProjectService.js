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
    // Добавьте другие методы для работы с проектами, например, для получения статистики и т.д.
}

module.exports = ProjectService;
