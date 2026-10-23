// =====================================================================
// Reports & Stored Procedures API Routes (Phase 5A)
// Uses MySQL 8.0 stored procedures & audit tables:
// - CALL GetLowStock() -> Returns batches with quantity < 30
// - CALL GetExpiryReport() -> Returns batches expiring within 90 days
// - GET /api/reports/dashboard-summary -> Non-duplicative scalar aggregates
// - GET /api/reports/sales-summary -> Sales summary metrics and audit records
// =====================================================================

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/reports/dashboard-summary
 * Computes non-duplicative scalar summary metrics for the clinical dashboard.
 * Evaluates independent tables to prevent join multiplication.
 */
router.get('/dashboard-summary', async (req, res) => {
  try {
    // 1. Total Medicines (COUNT(*) from medicine)
    const [[medResult]] = await pool.query('SELECT COUNT(*) AS totalMedicines FROM medicine;');

    // 2. Batch stock aggregates directly from medicinebatch
    const [[batchResult]] = await pool.query(`
      SELECT 
        COALESCE(SUM(quantity), 0) AS totalStock,
        COUNT(CASE WHEN quantity < 30 AND (expiry_date IS NULL OR expiry_date >= CURDATE()) THEN 1 END) AS lowStockBatches,
        COUNT(CASE WHEN expiry_date < CURDATE() THEN 1 END) AS expiredBatches,
        COUNT(CASE WHEN expiry_date >= CURDATE() AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 END) AS nearExpiryBatches
      FROM medicinebatch;
    `);

    // 3. Sales totals directly from sale (no joins = zero duplicate counting)
    const [[saleResult]] = await pool.query(`
      SELECT 
        COUNT(*) AS totalSales,
        COALESCE(SUM(total_amount), 0) AS totalSalesAmount
      FROM sale;
    `);

    // 4. Prescriptions total
    const [[rxResult]] = await pool.query('SELECT COUNT(*) AS totalPrescriptions FROM prescription;');

    res.status(200).json({
      success: true,
      data: {
        totalMedicines: parseInt(medResult.totalMedicines, 10),
        totalStock: parseInt(batchResult.totalStock, 10),
        lowStockBatches: parseInt(batchResult.lowStockBatches, 10),
        expiredBatches: parseInt(batchResult.expiredBatches, 10),
        nearExpiryBatches: parseInt(batchResult.nearExpiryBatches, 10),
        totalSales: parseInt(saleResult.totalSales, 10),
        totalSalesAmount: parseFloat(saleResult.totalSalesAmount),
        totalPrescriptions: parseInt(rxResult.totalPrescriptions, 10)
      }
    });
  } catch (error) {
    console.error('Error computing dashboard summary:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard summary metrics',
      details: error.message
    });
  }
});

/**
 * GET /api/reports/sales-summary
 * Summary of total sales, average order value, and recent sales audit records.
 * Uses schema tables `sale`, `patient`, `saleitem`.
 */
router.get('/sales-summary', async (req, res) => {
  try {
    // Scalar totals without joins
    const [[summaryResult]] = await pool.query(`
      SELECT 
        COUNT(*) AS totalSales,
        COALESCE(SUM(total_amount), 0) AS totalGrossSales,
        COALESCE(AVG(total_amount), 0) AS averageSaleValue
      FROM sale;
    `);

    // Recent sales list (last 10)
    const [recentRows] = await pool.query(`
      SELECT 
        s.sale_id AS id,
        CONCAT('INV-2026-', LPAD(s.sale_id, 4, '0')) AS invoiceNumber,
        DATE_FORMAT(s.sale_date, '%Y-%m-%d') AS date,
        COALESCE(p.patient_name, 'Walk-in Customer') AS patientName,
        s.total_amount AS totalAmount,
        COUNT(si.sale_item_id) AS itemCount,
        COALESCE(SUM(si.quantity), 0) AS totalUnits
      FROM sale s
      LEFT JOIN patient p ON s.patient_id = p.patient_id
      LEFT JOIN saleitem si ON s.sale_id = si.sale_id
      GROUP BY s.sale_id, s.sale_date, s.total_amount, p.patient_name
      ORDER BY s.sale_id DESC
      LIMIT 10;
    `);

    const formattedRecent = recentRows.map(r => ({
      id: r.id,
      invoiceNumber: r.invoiceNumber,
      date: r.date,
      patientName: r.patientName,
      totalAmount: parseFloat(r.totalAmount),
      itemCount: parseInt(r.itemCount, 10),
      totalUnits: parseInt(r.totalUnits, 10)
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalSales: parseInt(summaryResult.totalSales, 10),
        totalGrossSales: parseFloat(summaryResult.totalGrossSales),
        averageSaleValue: parseFloat(summaryResult.averageSaleValue)
      },
      recentSales: formattedRecent
    });
  } catch (error) {
    console.error('Error generating sales summary report:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate sales summary report',
      details: error.message
    });
  }
});

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
