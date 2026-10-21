// =====================================================================
// Reports & Stored Procedures API Routes
// =====================================================================

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /api/reports/low-stock - Executes GetLowStock stored procedure or fallback query
router.get('/low-stock', async (req, res) => {
  try {
    // Attempt executing the stored procedure first
    const [rows] = await pool.query('CALL GetLowStock();');
    res.json(rows[0] || rows);
  } catch (procErr) {
    // Fallback SQL query if stored procedure has not been imported yet
    try {
      const fallbackQuery = `
        SELECT 
          m.MedicineName AS medicineName,
          b.BatchNumber AS batchNumber,
          b.QuantityInStock AS stock,
          b.ReorderLevel AS reorderLevel
        FROM MedicineBatch b
        JOIN Medicine m ON b.MedicineID = m.MedicineID
        WHERE b.QuantityInStock <= b.ReorderLevel;
      `;
      const [fallbackRows] = await pool.query(fallbackQuery);
      res.json(fallbackRows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to generate low stock report', details: err.message });
    }
  }
});

// GET /api/reports/expiry - Executes GetExpiryReport stored procedure or fallback query
router.get('/expiry', async (req, res) => {
  try {
    const [rows] = await pool.query('CALL GetExpiryReport();');
    res.json(rows[0] || rows);
  } catch (procErr) {
    try {
      const fallbackQuery = `
        SELECT 
          m.MedicineName AS medicineName,
          b.BatchNumber AS batchNumber,
          b.ExpiryDate AS expiryDate,
          b.QuantityInStock AS stock,
          DATEDIFF(b.ExpiryDate, CURDATE()) AS daysRemaining
        FROM MedicineBatch b
        JOIN Medicine m ON b.MedicineID = m.MedicineID
        WHERE b.ExpiryDate <= DATE_ADD(CURDATE(), INTERVAL 60 DAY)
        ORDER BY b.ExpiryDate ASC;
      `;
      const [fallbackRows] = await pool.query(fallbackQuery);
      res.json(fallbackRows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to generate expiry report', details: err.message });
    }
  }
});

module.exports = router;
