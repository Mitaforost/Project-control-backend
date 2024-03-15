// services/DocumentService.js
const {pool, connectDB} = require('../utils/db');
const sql = require('mssql');

class DocumentService {
    static async createDocument(newDocument) {
        try {
            await connectDB();

            const currentDate = new Date().toISOString();

            const result = await pool
                .request()
                .input('title', sql.NVarChar, newDocument.Title)
                .input('content', sql.NVarChar, newDocument.Content)
                .input('senderID', sql.Int, newDocument.SenderID)
                .input('receiverID', sql.Int, newDocument.ReceiverID)
                .input('dateCreated', sql.DateTime, currentDate)
                .input('actionByUserID', sql.Int, newDocument.SenderID) // Добавлено новое поле
                .query(`
                    INSERT INTO Documents (Title, Content, SenderID, ReceiverID, DateCreated, ActionByUserID)
                    VALUES (@title, @content, @senderID, @receiverID, @dateCreated, @actionByUserID);
                    SELECT *
                    FROM Documents
                    WHERE DocumentID = SCOPE_IDENTITY();
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
                    SELECT *
                    FROM Documents
                    WHERE SenderID = @userID
                       OR ReceiverID = @userID;
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
            console.log('Fetching all documents...');
            return result.recordset;
        } catch (error) {
            console.error('Error fetching all documents from the database:', error.message);
            throw error;
        }
    }

    static async signDocument(documentID, signedByUserID) {
        try {
            await connectDB();

            const document = await this.getDocumentById(documentID);

            if (!document) {
                throw new Error('Document not found'); // Документ не найден
            }

            if (document.Status !== 'Pending') {
                throw new Error('Invalid document status for signing'); // Неверный статус документа для подписания
            }

            const result = await pool
                .request()
                .input('documentID', sql.Int, documentID)
                .input('signedByUserID', sql.Int, signedByUserID)
                .query(`
                UPDATE Documents
                SET Status         = 'Signed',
                    Action         = 'Подписано пользователем ' + CAST(@signedByUserID AS NVARCHAR),
                    SignedByUserID = @signedByUserID
                WHERE DocumentID = @documentID;

                SELECT *
                FROM Documents
                WHERE DocumentID = @documentID;
            `);

            return result.recordset[0];
        } catch (error) {
            console.error('Error signing document in the database:', error.message);
            throw error;
        }
    }


    static async updateDocumentStatus(documentID, newStatus, userAccessLevel) {
        try {
            console.log('Updating document status:', documentID, newStatus, userAccessLevel);

            if (userAccessLevel === 2) {  // Check for manager level access
                const result = await pool
                    .request()
                    .input('documentID', sql.Int, documentID)
                    .input('newStatus', sql.NVarChar, newStatus)
                    .query(`
                        UPDATE Documents
                        SET Status         = @newStatus,
                            Action         = 'Document updated to ' + @newStatus,
                            ActionByUserID = 0,                                                   -- Replace with appropriate user ID if needed
                            SignedByUserID = CASE WHEN @newStatus = 'Signed' THEN 0 ELSE NULL END -- Replace with appropriate user ID if needed
                        WHERE DocumentID = @documentID;
                    `);

                if (result && result.rowsAffected && result.rowsAffected > 0) {
                    return result.rowsAffected;
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
    static async signDocumentStatus(documentID, newStatus, userAccessLevel) {
        try {
            console.log('Updating document status:', documentID, newStatus, userAccessLevel);

            if (userAccessLevel === 1) {  // Check for manager level access
                const result = await pool
                    .request()
                    .input('documentID', sql.Int, documentID)
                    .input('newStatus', sql.NVarChar, newStatus)
                    .query(`
                        UPDATE Documents
                        SET Status         = @newStatus,
                            Action         = 'Document updated to ' + @newStatus,
                            ActionByUserID = 0,                                                   -- Replace with appropriate user ID if needed
                            SignedByUserID = CASE WHEN @newStatus = 'Signed' THEN 0 ELSE NULL END -- Replace with appropriate user ID if needed
                        WHERE DocumentID = @documentID;
                    `);

                if (result && result.rowsAffected && result.rowsAffected > 0) {
                    return result.rowsAffected;
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

    static async getDocumentById(documentID) {
        try {
            console.log('Fetching document with ID:', documentID);
            await connectDB();

            const result = await pool
                .request()
                .input('documentID', sql.Int, documentID)
                .query(`
                SELECT *
                FROM Documents
                WHERE DocumentID = @documentID;
            `);

            console.log('SQL Query Result:', result);

            if (result.recordset.length > 0) {
                console.log('Found document:', result.recordset[0]);
                return result.recordset[0];
            } else {
                console.log('Document not found');
                return null; // Возвращаем null, если документ не найден
            }
        } catch (error) {
            console.error('Error fetching document by ID from the database:', error.message);
            throw error;
        }
    }

    static async sendDocumentForSigning(documentID, newStatus, userAccessLevel) {
        try {
            await connectDB();

            const document = await this.getDocumentById(documentID);

            if (document && document.Status === 'Draft') {
                const result = await pool
                    .request()
                    .input('documentID', sql.Int, documentID)
                    .input('sentByUserID', sql.Int, sentByUserID)
                    .query(`
                        UPDATE Documents
                        SET Status         = 'Pending',
                            Action         = 'Документ отправлен на подпись админу пользователем ' +
                                             CAST(@sentByUserID AS NVARCHAR),
                            ActionByUserID = @sentByUserID
                        WHERE DocumentID = @documentID;

                        SELECT *
                        FROM Documents
                        WHERE DocumentID = @documentID;
                    `);

                return result.recordset[0];
            } else {
                throw new Error('Invalid document status for sending for signing');
            }
        } catch (error) {
            console.error('Error sending document for signing in the database:', error.message);
            throw error;
        }
    }

}

module.exports = DocumentService;
