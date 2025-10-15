const mysql2 = require('mysql2/promise');

require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function connectToDatabase() {
    try {
        const connection = await mysql2.createConnection(dbConfig);
        return connection;
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

module.exports = { connectToDatabase };