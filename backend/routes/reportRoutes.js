// =====================================================================
// Reports & Stored Procedures API Routes
// Uses MySQL 8.0 stored procedures:
// - CALL GetLowStock() -> Returns batches with quantity < 30
// - CALL GetExpiryReport() -> Returns batches expiring within 90 days
// =====================================================================

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/reports/low-stock
 * Executes the MySQL stored procedure GetLowStock()
 * Existing DB threshold: quantity < 30
 */
router.get('/low-stock', async (req, res) => {
  try {
    // Attempt executing the stored procedure first
    const [rows] = await pool.query('CALL GetLowStock();');
    const rawData = rows[0] || [];

    const formattedData = rawData.map(r => ({
      medicineName: r.medicine_name || r.medicineName || 'Unknown Medicine',
      batchNumber: r.batch_number || r.batchNumber || 'N/A',
      stock: r.quantity !== undefined ? parseInt(r.quantity, 10) : parseInt(r.stock, 10),
      reorderLevel: 30, // Existing GetLowStock() definition checks quantity < 30
      condition: 'Below Reorder Threshold (< 30 units)'
    }));

    return res.status(200).json({
      success: true,
      source: 'GetLowStock() Stored Procedure',
      threshold: 30,
      count: formattedData.length,
      data: formattedData
    });
  } catch (procErr) {
    console.warn('Stored procedure GetLowStock() failed, attempting fallback query:', procErr.message);

    // Fallback SQL query matching exact database schema
    try {
      const fallbackQuery = `
        SELECT 
          m.medicine_name AS medicineName,
          b.batch_number AS batchNumber,
          b.quantity AS stock,
          30 AS reorderLevel
        FROM medicinebatch b
        JOIN medicine m ON b.medicine_id = m.medicine_id
        WHERE b.quantity < 30
        ORDER BY b.quantity ASC;
      `;
      const [fallbackRows] = await pool.query(fallbackQuery);

      const formattedData = fallbackRows.map(r => ({
        medicineName: r.medicineName,
        batchNumber: r.batchNumber,
        stock: parseInt(r.stock, 10),
        reorderLevel: 30,
        condition: 'Below Reorder Threshold (< 30 units)'
      }));

      return res.status(200).json({
        success: true,
        source: 'Fallback SQL Query (< 30 units)',
        threshold: 30,
        count: formattedData.length,
        data: formattedData
      });
    } catch (err) {
      console.error('Failed to generate low stock report:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate low stock report',
        details: err.message
      });
    }
  }
});

/**
 * GET /api/reports/expiry
 * Executes the MySQL stored procedure GetExpiryReport()
 * Returns batches expiring within 90 days.
 * Accurately distinguishes between expired (daysRemaining < 0)
 * and expiring soon (daysRemaining >= 0).
 */
router.get('/expiry', async (req, res) => {
  try {
    const [rows] = await pool.query('CALL GetExpiryReport();');
    const rawData = rows[0] || [];

    const formattedData = rawData.map(r => {
      const rawDate = r.expiry_date || r.expiryDate;
      const expiryDateStr = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : '';

      // Calculate days remaining from today at midnight
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const expDate = new Date(rawDate);
      const diffTime = expDate.setHours(0, 0, 0, 0) - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isExpired = daysRemaining < 0;
      let statusLabel = '';
      let badgeType = '';
      let actionRequired = '';

      if (isExpired) {
        statusLabel = `Expired (${Math.abs(daysRemaining)} days ago)`;
        badgeType = 'expired';
        actionRequired = 'Quarantine & Safe Disposal';
      } else if (daysRemaining <= 30) {
        statusLabel = `Expiring Soon (${daysRemaining}d left)`;
        badgeType = 'warning';
        actionRequired = 'Priority FEFO Dispensing';
      } else {
        statusLabel = `Approaching Expiry (${daysRemaining}d left)`;
        badgeType = 'approaching';
        actionRequired = 'Monitor Stock Levels';
      }

      return {
        medicineName: r.medicine_name || r.medicineName || 'Unknown Medicine',
        batchNumber: r.batch_number || r.batchNumber || 'N/A',
        stock: r.quantity !== undefined ? parseInt(r.quantity, 10) : parseInt(r.stock, 10),
        expiryDate: expiryDateStr,
        daysRemaining,
        isExpired,
        statusLabel,
        badgeType,
        actionRequired
      };
    });

    return res.status(200).json({
      success: true,
      source: 'GetExpiryReport() Stored Procedure (90-day window)',
      count: formattedData.length,
      data: formattedData
    });
  } catch (procErr) {
    console.warn('Stored procedure GetExpiryReport() failed, attempting fallback query:', procErr.message);

    try {
      const fallbackQuery = `
        SELECT 
          m.medicine_name AS medicineName,
          b.batch_number AS batchNumber,
          b.quantity AS stock,
          DATE_FORMAT(b.expiry_date, '%Y-%m-%d') AS expiryDate,
          DATEDIFF(b.expiry_date, CURDATE()) AS daysRemaining
        FROM medicinebatch b
        JOIN medicine m ON b.medicine_id = m.medicine_id
        WHERE b.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)
        ORDER BY b.expiry_date ASC;
      `;
      const [fallbackRows] = await pool.query(fallbackQuery);

      const formattedData = fallbackRows.map(r => {
        const daysRemaining = parseInt(r.daysRemaining, 10);
        const isExpired = daysRemaining < 0;
        let statusLabel = '';
        let badgeType = '';
        let actionRequired = '';

        if (isExpired) {
          statusLabel = `Expired (${Math.abs(daysRemaining)} days ago)`;
          badgeType = 'expired';
          actionRequired = 'Quarantine & Safe Disposal';
        } else if (daysRemaining <= 30) {
          statusLabel = `Expiring Soon (${daysRemaining}d left)`;
          badgeType = 'warning';
          actionRequired = 'Priority FEFO Dispensing';
        } else {
          statusLabel = `Approaching Expiry (${daysRemaining}d left)`;
          badgeType = 'approaching';
          actionRequired = 'Monitor Stock Levels';
        }

        return {
          medicineName: r.medicineName,
          batchNumber: r.batchNumber,
          stock: parseInt(r.stock, 10),
          expiryDate: r.expiryDate,
          daysRemaining,
          isExpired,
          statusLabel,
          badgeType,
          actionRequired
        };
      });

      return res.status(200).json({
        success: true,
        source: 'Fallback SQL Query (90-day window)',
        count: formattedData.length,
        data: formattedData
      });
    } catch (err) {
      console.error('Failed to generate expiry report:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate expiry report',
        details: err.message
      });
    }
  }
});

module.exports = router;
