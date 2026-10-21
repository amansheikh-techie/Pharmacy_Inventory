// =====================================================================
// PharmaCare Clinical Management System - Express Backend Server
// =====================================================================

const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for parsing JSON requests
app.use(express.json());

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    system: 'PharmaCare Clinical Inventory & Prescription Management'
  });
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🏥 PharmaCare Clinical Server Running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
