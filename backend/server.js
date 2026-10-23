// =====================================================================
// Phase 3A: Pharmacy Inventory Backend Server
// Technology: Node.js, Express, MySQL 8.0 (mysql2), dotenv, cors
// =====================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Database connection module
const { testConnection } = require('./db');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================================
// Middlewares
// =====================================================================
// Enable Cross-Origin Resource Sharing (allows frontend to call API from any port)
app.use(cors());

// Parse incoming JSON request payloads
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// =====================================================================
// API Routes
// =====================================================================
const medicineRoutes = require('./routes/medicineRoutes');
const batchRoutes = require('./routes/batchRoutes');
const reportRoutes = require('./routes/reportRoutes');
const salesRoutes = require('./routes/salesRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
app.use('/api/medicines', medicineRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// =====================================================================
// API Health-Check Endpoint (GET /api/health)
// Returns system status and tests real MySQL connectivity
// =====================================================================
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();

  const healthData = {
    status: 'online',
    system: 'Pharmacy Inventory and Prescription Management System',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.success,
      name: process.env.DB_NAME || 'pharmacy_db',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      details: dbStatus.success ? dbStatus.message : dbStatus.error,
      troubleshooting: dbStatus.success ? null : dbStatus.troubleshooting
    }
  };

  // Return 200 OK even if DB is not connected yet, so client can read the troubleshooting message
  res.status(200).json(healthData);
});

// =====================================================================
// Serve Static Frontend (HTML, CSS, JS)
// =====================================================================
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback route: Serves index.html for single-page application navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// =====================================================================
// Server Startup & Database Verification
// =====================================================================
app.listen(PORT, async () => {
  console.log(`\n=============================================================`);
  console.log(`🏥 Pharmacy Management Backend Server Running`);
  console.log(`🌐 Local URL:        http://localhost:${PORT}`);
  console.log(`🔍 Health Check URL: http://localhost:${PORT}/api/health`);
  console.log(`=============================================================`);

  // Verify real MySQL connectivity on startup
  console.log(`Testing MySQL connection to "${process.env.DB_NAME || 'pharmacy_db'}"...`);
  const dbTest = await testConnection();

  if (dbTest.success) {
    console.log(`✓ MySQL Connection: SUCCESSFUL!`);
    console.log(`  Database: ${dbTest.database} on ${dbTest.host}`);
  } else {
    console.log(`⚠️ MySQL Connection Notice:`);
    console.log(`  Code:            ${dbTest.code}`);
    console.log(`  Error:           ${dbTest.error}`);
    console.log(`  Troubleshooting: ${dbTest.troubleshooting}`);
    console.log(`💡 Note: Create or edit backend/.env with your MySQL root password to connect.`);
  }
  console.log(`=============================================================\n`);
});
