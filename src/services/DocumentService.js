// services/DocumentService.js
const { pool, connectDB } = require('../utils/db');
const sql = require('mssql');

class DocumentService {
    static async createDocument(newDocument) {
        try {
            await connectDB();

            const currentDate = new Date().toISOString(); // Получаем текущую дату и время в формате строки

            const result = await pool
                .request()
                .input('title', sql.NVarChar, newDocument.Title)
                .input('content', sql.NVarChar, newDocument.Content)
                .input('senderID', sql.Int, newDocument.SenderID)
                .input('receiverID', sql.Int, newDocument.ReceiverID)
                .input('dateCreated', sql.DateTime, currentDate) // Передаем текущую дату
                .query(`
                INSERT INTO Documents (Title, Content, SenderID, ReceiverID, DateCreated)
                VALUES (@title, @content, @senderID, @receiverID, @dateCreated);
                SELECT * FROM Documents WHERE DocumentID = SCOPE_IDENTITY();
            `);

            return result.recordset[0];
        } catch (error) {
            console.error('Error creating document in the database:', error.message);
            throw error;
        }
    }

    static async getDocumentsByUser(userID) {
        try {
            await connectDB();

            const result = await pool
                .request()
                .input('userID', sql.Int, userID)
                .query(`
                    SELECT * FROM Documents
                    WHERE SenderID = @userID OR ReceiverID = @userID;
                `);

            return result.recordset;
        } catch (error) {
            console.error('Error fetching documents by user from the database:', error.message);
            throw error;
        }
    }

    static async getDocuments() {
        try {
            await connectDB();

            const result = await pool
                .request()
                .query('SELECT * FROM Documents');

            return result.recordset;
        } catch (error) {
            console.error('Error fetching all documents from the database:', error.message);
            throw error;
        }
    }

    static async signDocument(documentID, signedByUserID, userAccessLevel) {
        try {
            if (userAccessLevel === 1 || userAccessLevel === 2) {
                await connectDB();

                const result = await pool
                    .request()
                    .input('documentID', sql.Int, documentID)
                    .input('signedByUserID', sql.Int, signedByUserID)
                    .query(`
                    UPDATE Documents
                    SET Status = 'Signed', Action = 'Sign', SignedByUserID = @signedByUserID
                    WHERE DocumentID = @documentID;
                `);

                return result.recordset[0];
            } else {
                throw new Error('User does not have permission to sign documents.');
            }
        } catch (error) {
            console.error('Error signing document in the database:', error.message);
            throw error;
        }
    }

    static async updateDocumentStatus(documentID, newStatus, userAccessLevel) {
        try {
            if (userAccessLevel === 1 || userAccessLevel === 2) {
                await connectDB();

                const result = await pool
                    .request()
                    .input('documentID', sql.Int, documentID)
                    .input('newStatus', sql.NVarChar, newStatus)
                    .query(`
                    UPDATE Documents
                    SET Status = @newStatus
                    WHERE DocumentID = @documentID;
                `);

                if (result && result.recordset && result.recordset.length > 0) {
                    return result.recordset[0];
                } else {
                    return null;
                }
            } else {
                throw new Error('User does not have permission to update document status.');
            }
        } catch (error) {
            console.error('Error updating document status:', error.message);
            throw error;
        }
    }

    // Добавьте другие методы, например, для изменения статуса документа и т.д.
}

module.exports = DocumentService;
