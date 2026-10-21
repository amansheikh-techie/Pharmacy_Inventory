// =====================================================================
// Sales & Billing API Routes
// =====================================================================

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /api/sales - Fetch sales ledger with item details
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.SaleID AS id,
        s.SaleDate AS date,
        COALESCE(p.PatientName, 'Walk-in Customer') AS patientName,
        d.DoctorName AS doctorName,
        s.PaymentMethod AS paymentMethod,
        s.TotalAmount AS totalAmount
      FROM Sale s
      LEFT JOIN Patient p ON s.PatientID = p.PatientID
      LEFT JOIN Prescription rx ON s.PrescriptionID = rx.PrescriptionID
      LEFT JOIN Doctor d ON rx.DoctorID = d.DoctorID
      ORDER BY s.SaleDate DESC;
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve sales', details: error.message });
  }
});

// POST /api/sales - Process a sale transaction (validates stock, deducts batch inventory, records items)
router.post('/', async (req, res) => {
  const { patientId, prescriptionId, paymentMethod, batchId, quantity } = req.body;

  if (!batchId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Valid batch and quantity > 0 are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Lock batch row and verify stock & expiry
    const [batches] = await connection.query(
      'SELECT BatchID, SellingPrice, QuantityInStock, DATEDIFF(ExpiryDate, CURDATE()) AS daysLeft FROM MedicineBatch WHERE BatchID = ? FOR UPDATE',
      [batchId]
    );

    if (batches.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Batch not found' });
    }

    const batch = batches[0];

    // Check expiry
    if (batch.daysLeft < 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Cannot sell medication: Batch has expired!' });
    }

    // Check stock
    if (batch.QuantityInStock < quantity) {
      await connection.rollback();
      return res.status(400).json({ error: `Insufficient stock: only ${batch.QuantityInStock} units available` });
    }

    const unitPrice = parseFloat(batch.SellingPrice);
    const subtotal = unitPrice * quantity;

    // 2. Insert Sale master record
    const [saleResult] = await connection.query(
      'INSERT INTO Sale (PatientID, PrescriptionID, TotalAmount, PaymentMethod) VALUES (?, ?, ?, ?)',
      [patientId || null, prescriptionId || null, subtotal, paymentMethod || 'Cash']
    );
    const newSaleId = saleResult.insertId;

    // 3. Insert SaleItem detail row
    await connection.query(
      'INSERT INTO SaleItem (SaleID, BatchID, Quantity, UnitPrice, Subtotal) VALUES (?, ?, ?, ?, ?)',
      [newSaleId, batchId, quantity, unitPrice, subtotal]
    );

    // 4. Deduct inventory stock from MedicineBatch
    await connection.query(
      'UPDATE MedicineBatch SET QuantityInStock = QuantityInStock - ? WHERE BatchID = ?',
      [quantity, batchId]
    );

    // 5. If this was linked to a Prescription, mark it as Fulfilled
    if (prescriptionId) {
      await connection.query('UPDATE Prescription SET Status = "Fulfilled" WHERE PrescriptionID = ?', [prescriptionId]);
    }

    await connection.commit();
    res.status(201).json({
      message: 'Sale completed successfully',
      saleId: newSaleId,
      totalAmount: subtotal,
      remainingStock: batch.QuantityInStock - quantity
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Sale transaction failed', details: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
