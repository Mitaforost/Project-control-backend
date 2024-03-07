// models/Document.js
const { DataTypes } = require('sequelize');
const db = require('../utils/db');

const Document = db.define('Document', {
    DocumentID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Content: {
        type: DataTypes.TEXT,
    },
    DateCreated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    SenderID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ReceiverID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Status: {
        type: DataTypes.ENUM('Draft', 'Pending', 'Signed'),
        defaultValue: 'Draft',
    },
});

module.exports = Document;
