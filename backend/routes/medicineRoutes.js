// =====================================================================
// Medicine & Batch API Routes
// =====================================================================

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /api/medicines - Fetch all medicines with aggregated stock counts
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        m.MedicineID AS id,
        m.MedicineName AS name,
        m.GenericName AS generic,
        c.CategoryName AS categoryName,
        COALESCE(SUM(b.QuantityInStock), 0) AS totalStock,
        COUNT(b.BatchID) AS batchCount
      FROM Medicine m
      LEFT JOIN Category c ON m.CategoryID = c.CategoryID
      LEFT JOIN MedicineBatch b ON m.MedicineID = b.MedicineID
      GROUP BY m.MedicineID, m.MedicineName, m.GenericName, c.CategoryName
      ORDER BY m.MedicineName ASC;
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve medicines', details: error.message });
  }
});

// GET /api/medicines/batches - Fetch all individual inventory batches
router.get('/batches', async (req, res) => {
  try {
    const query = `
      SELECT 
        b.BatchID AS id,
        b.BatchNumber AS batchNumber,
        m.MedicineName AS medicineName,
        b.ExpiryDate AS expiryDate,
        b.PurchasePrice AS purchasePrice,
        b.SellingPrice AS sellingPrice,
        b.QuantityInStock AS stock,
        b.ReorderLevel AS reorderLevel,
        DATEDIFF(b.ExpiryDate, CURDATE()) AS daysToExpiry
      FROM MedicineBatch b
      JOIN Medicine m ON b.MedicineID = m.MedicineID
      ORDER BY b.ExpiryDate ASC;
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve batches', details: error.message });
  }
});

// POST /api/medicines - Insert a new medicine and initial batch using a database transaction
router.post('/', async (req, res) => {
  const { name, generic, categoryId, batchNumber, expiryDate, purchasePrice, sellingPrice, stock, reorderLevel } = req.body;

  if (!name || !batchNumber || !expiryDate || stock === undefined) {
    return res.status(400).json({ error: 'Missing required medicine or batch fields' });
  }

  const connection = await pool.getConnection();
  try {
    // Start database transaction
    await connection.beginTransaction();

    // 1. Insert Medicine
    const [medResult] = await connection.query(
      'INSERT INTO Medicine (CategoryID, MedicineName, GenericName) VALUES (?, ?, ?)',
      [categoryId || null, name, generic || name]
    );
    const newMedicineId = medResult.insertId;

    // 2. Insert Batch linked to the new MedicineID
    await connection.query(
      `INSERT INTO MedicineBatch (MedicineID, BatchNumber, ExpiryDate, PurchasePrice, SellingPrice, QuantityInStock, ReorderLevel)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newMedicineId, batchNumber, expiryDate, purchasePrice || 0, sellingPrice || 0, stock, reorderLevel || 10]
    );

    // Commit both inserts together
    await connection.commit();
    res.status(201).json({ message: 'Medicine and Batch created successfully', medicineId: newMedicineId });
  } catch (error) {
    // If any error occurs, rollback both inserts
    await connection.rollback();
    res.status(500).json({ error: 'Transaction failed', details: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
