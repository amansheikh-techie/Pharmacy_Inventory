// =====================================================================
// PharmaCare Clinical Management System - Express Backend Server
// =====================================================================

const express = require('express');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/db');

// Route modules
const medicineRoutes = require('./routes/medicineRoutes');
const salesRoutes = require('./routes/salesRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for parsing JSON request bodies
app.use(express.json());

// API Endpoints
app.use('/api/medicines', medicineRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    system: 'PharmaCare Clinical Inventory & Prescription Management'
  });
});

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback to index.html for Single Page Navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start listening
app.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`🏥 PharmaCare Clinical Server Running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`==================================================`);
  
  // Test connection to local MySQL server
  await testConnection();
});
