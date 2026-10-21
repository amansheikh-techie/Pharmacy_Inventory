// =====================================================================
// Phase 3A: MySQL 8.0 Database Connection Module
// Technology: Node.js + mysql2/promise + dotenv
// Database: pharmacy_db
// =====================================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool using environment variables
// Connection pooling manages multiple reusable connections efficiently
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pharmacy_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Tests database connectivity and properly releases the connection.
 * Returns an object with connection status and helpful troubleshooting details.
 */
async function testConnection() {
  let connection;
  try {
    // Acquire a connection from the pool
    connection = await pool.getConnection();
    
    // Run a lightweight ping query
    const [result] = await connection.query('SELECT 1 + 1 AS ping, DATABASE() AS currentDb;');
    
    return {
      success: true,
      database: result[0].currentDb || process.env.DB_NAME || 'pharmacy_db',
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      message: 'Successfully connected to MySQL database.'
    };
  } catch (error) {
    let troubleshooting = 'General database error.';

    if (error.code === 'ECONNREFUSED') {
      troubleshooting = 'MySQL Server is not running or the DB_PORT (3306) is incorrect. Start MySQL via Windows Services or MySQL Workbench.';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      troubleshooting = 'Access denied for user. Please verify DB_USER and DB_PASSWORD in backend/.env.';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      troubleshooting = `Database "${process.env.DB_NAME || 'pharmacy_db'}" does not exist. Please create it or run database/schema.sql in MySQL.`;
    }

    return {
      success: false,
      code: error.code || 'UNKNOWN_ERROR',
      error: error.message,
      troubleshooting
    };
  } finally {
    // Always release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  pool,
  testConnection
};
