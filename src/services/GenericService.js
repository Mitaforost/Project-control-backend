const { pool, connectDB } = require('../utils/db');
const sql = require('mssql');

class GenericService {
    static async getData(tableName, page = 1, pageSize = 10) {
        try {
            await connectDB();

            const offset = (page - 1) * pageSize;

            const result = await pool
                .request()
                .input('offset', sql.Int, offset)
                .input('pageSize', sql.Int, pageSize)
                .query(`SELECT * FROM ${tableName} ORDER BY ${tableName}ID OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`);

            const data = result.recordset;
            console.log(`SQL Query Result for ${tableName}:`, data);

            return data;
        } catch (error) {
            console.error(`Error fetching data from ${tableName} table:`, error.message);
            throw error;
        }
    }

    static async getDataCount(tableName) {
        try {
            await connectDB();

            const result = await pool.request().query(`SELECT COUNT(*) AS ${tableName}Count FROM ${tableName}`);

            return result.recordset[0][`${tableName}Count`];
        } catch (error) {
            console.error(`Error fetching ${tableName} count from the database:`, error.message);
            throw error;
        }
    }
}

module.exports = GenericService;
