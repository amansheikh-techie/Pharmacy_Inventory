// =====================================================================
// Database Connection Pool (MySQL 8.0)
// Uses mysql2/promise for async/await queries
// Credentials are read securely from process.env (.env file)
// =====================================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool to efficiently handle multiple queries
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

// Helper function to test the database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Successfully connected to MySQL database: ' + (process.env.DB_NAME || 'pharmacy_db'));
    connection.release();
    return true;
  } catch (error) {
    console.warn('⚠️ MySQL connection warning:', error.message);
    console.warn('💡 Tip: Ensure MySQL is running and your credentials in backend/.env are correct.');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
