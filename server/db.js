// server/db.js
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  // Auto-reconnect on failure
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  if (connection) {
    console.log('Connected to MySQL Database');
    connection.release();
  }
});

module.exports = pool.promise();