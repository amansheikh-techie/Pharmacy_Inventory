// =====================================================================
// Phase 4C: Sales & Billing API Routes
// Uses actual MySQL schema: sale, saleitem, medicinebatch, medicine, patient
// Enforces transaction safety and leverages automated stock triggers
// (check_sale_stock & after_saleitem_insert)
// =====================================================================

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/sales/patients
 * Helper endpoint: Fetch patient list for sale/billing customer dropdown
 */
router.get('/patients', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT patient_id AS id, patient_name AS name, phone FROM patient ORDER BY patient_name ASC'
    );
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching patients for sales:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve patients',
      details: error.message
    });
  }
});

/**
 * GET /api/sales
 * Return sales history with invoice number, date, patient details, and total amount.
 * Supports pagination via ?limit=50&offset=0
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const countQuery = 'SELECT COUNT(*) AS total FROM sale';
    const [[{ total }]] = await pool.query(countQuery);

    const query = `
      SELECT 
        s.sale_id AS id,
        CONCAT('INV-2026-', LPAD(s.sale_id, 4, '0')) AS invoiceNumber,
        DATE_FORMAT(s.sale_date, '%Y-%m-%d') AS date,
        s.total_amount AS totalAmount,
        s.patient_id AS patientId,
        COALESCE(p.patient_name, 'Walk-in Customer') AS patientName,
        p.phone AS patientPhone,
        COUNT(si.sale_item_id) AS itemCount,
        COALESCE(SUM(si.quantity), 0) AS totalUnits
      FROM sale s
      LEFT JOIN patient p ON s.patient_id = p.patient_id
      LEFT JOIN saleitem si ON s.sale_id = si.sale_id
      GROUP BY s.sale_id, s.sale_date, s.total_amount, s.patient_id, p.patient_name, p.phone
      ORDER BY s.sale_id DESC
      LIMIT ? OFFSET ?;
    `;

    const [rows] = await pool.query(query, [limit, offset]);

    const formattedData = rows.map(r => ({
      id: r.id,
      invoiceNumber: r.invoiceNumber,
      date: r.date,
      totalAmount: parseFloat(r.totalAmount),
      patientId: r.patientId,
      patientName: r.patientName,
      patientPhone: r.patientPhone,
      itemCount: parseInt(r.itemCount, 10),
      totalUnits: parseInt(r.totalUnits, 10)
    }));

    res.status(200).json({
      success: true,
      count: formattedData.length,
      total,
      limit,
      offset,
      data: formattedData
    });
  } catch (error) {
    console.error('Error fetching sales ledger from MySQL:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve sales history',
      details: error.message
    });
  }
});

/**
 * GET /api/sales/:id
 * Return one sale and its associated items with batch and medicine details.
 */
router.get('/:id', async (req, res) => {
  const saleId = parseInt(req.params.id, 10);
  if (isNaN(saleId) || saleId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid sale ID. Must be a positive integer.'
    });
  }

  try {
    const saleQuery = `
      SELECT 
        s.sale_id AS id,
        CONCAT('INV-2026-', LPAD(s.sale_id, 4, '0')) AS invoiceNumber,
        DATE_FORMAT(s.sale_date, '%Y-%m-%d') AS date,
        s.total_amount AS totalAmount,
        s.patient_id AS patientId,
        COALESCE(p.patient_name, 'Walk-in Customer') AS patientName,
        p.phone AS patientPhone
      FROM sale s
      LEFT JOIN patient p ON s.patient_id = p.patient_id
      WHERE s.sale_id = ?;
    `;

    const [sales] = await pool.query(saleQuery, [saleId]);
    if (sales.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Sale record #${saleId} not found.`
      });
    }

    const sale = sales[0];

    // Fetch line items joined with medicinebatch and medicine
    const itemsQuery = `
      SELECT 
        si.sale_item_id AS itemId,
        si.batch_id AS batchId,
        b.batch_number AS batchNumber,
        DATE_FORMAT(b.expiry_date, '%Y-%m-%d') AS expiryDate,
        m.medicine_id AS medicineId,
        m.medicine_name AS medicineName,
        m.manufacturer,
        si.quantity,
        si.unit_price AS unitPrice,
        ROUND(si.quantity * si.unit_price, 2) AS subtotal
      FROM saleitem si
      JOIN medicinebatch b ON si.batch_id = b.batch_id
      JOIN medicine m ON b.medicine_id = m.medicine_id
      WHERE si.sale_id = ?
      ORDER BY si.sale_item_id ASC;
    `;

    const [items] = await pool.query(itemsQuery, [saleId]);

    const formattedItems = items.map(item => ({
      itemId: item.itemId,
      batchId: item.batchId,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      manufacturer: item.manufacturer,
      quantity: parseInt(item.quantity, 10),
      unitPrice: parseFloat(item.unitPrice),
      subtotal: parseFloat(item.subtotal)
    }));

    res.status(200).json({
      success: true,
      data: {
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        date: sale.date,
        totalAmount: parseFloat(sale.totalAmount),
        patientId: sale.patientId,
        patientName: sale.patientName,
        patientPhone: sale.patientPhone,
        itemsCount: formattedItems.length,
        items: formattedItems
      }
    });
  } catch (error) {
    console.error(`Error fetching sale #${saleId}:`, error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve sale details',
      details: error.message
    });
  }
});

/**
 * POST /api/sales
 * Create a new sale and its sale items within a MySQL transaction.
 *
 * Payload:
 * {
 *   patientId: 1, // optional, number or null
 *   saleDate: "2026-10-24", // optional, defaults to CURDATE()
 *   items: [
 *     { batchId: 1, quantity: 2 },
 *     { batchId: 3, quantity: 1 }
 *   ]
 *   // Shorthand for single-item: batchId: 1, quantity: 2
 * }
 *
 * Safety & Transaction Guarantees:
 * 1. Uses connection.beginTransaction() / commit() / rollback().
 * 2. Locks batch rows with SELECT ... FOR UPDATE to prevent race conditions.
 * 3. Uses trusted unit_price from medicinebatch (never trusts client price).
 * 4. Checks stock and clinical expiration before inserting.
 * 5. Leverages BEFORE INSERT trigger check_sale_stock (raises SQLSTATE 45000 on oversell).
 * 6. Leverages AFTER INSERT trigger after_saleitem_insert:
 *    - Updates MedicineBatch stock (no double-deduction in app code!)
 *    - Accumulates Sale.total_amount (no double-counting in app code!)
 */
router.post('/', async (req, res) => {
  const { patientId, saleDate } = req.body;

  // Normalize items input: support both items array and single batchId/quantity shorthand
  let rawItems = [];
  if (Array.isArray(req.body.items) && req.body.items.length > 0) {
    rawItems = req.body.items;
  } else if (req.body.batchId !== undefined && req.body.quantity !== undefined) {
    rawItems = [{ batchId: req.body.batchId, quantity: req.body.quantity }];
  } else {
    return res.status(400).json({
      success: false,
      error: 'Sales transaction must contain at least one valid item with batchId and positive quantity.'
    });
  }

  // Validate item format and consolidate any duplicates for the same batch
  const consolidatedMap = new Map();
  for (let idx = 0; idx < rawItems.length; idx++) {
    const it = rawItems[idx];
    const bId = parseInt(it.batchId, 10);
    const qty = parseInt(it.quantity, 10);

    if (isNaN(bId) || bId <= 0) {
      return res.status(400).json({
        success: false,
        error: `Item at index ${idx} has an invalid batch ID. Must be a positive integer.`
      });
    }

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        error: `Item at index ${idx} has an invalid quantity (${it.quantity}). Quantity must be a positive integer (> 0).`
      });
    }

    const currentQty = consolidatedMap.get(bId) || 0;
    consolidatedMap.set(bId, currentQty + qty);
  }

  const itemsToProcess = Array.from(consolidatedMap.entries()).map(([batchId, quantity]) => ({
    batchId,
    quantity
  }));

  // Validate patientId if provided
  let validatedPatientId = null;
  if (patientId !== undefined && patientId !== null && patientId !== '') {
    const parsedPatId = parseInt(patientId, 10);
    if (isNaN(parsedPatId) || parsedPatId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid patientId. Must be a positive integer or null for walk-in customers.'
      });
    }

    const [patCheck] = await pool.query('SELECT patient_id FROM patient WHERE patient_id = ?', [parsedPatId]);
    if (patCheck.length === 0) {
      return res.status(400).json({
        success: false,
        error: `Referenced patient ID ${parsedPatId} does not exist in patient registry.`
      });
    }
    validatedPatientId = parsedPatId;
  }

  // Validate saleDate format if provided
  let formattedSaleDate = null;
  if (saleDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(saleDate) || isNaN(Date.parse(saleDate))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid saleDate format. Expected YYYY-MM-DD.'
      });
    }
    formattedSaleDate = saleDate;
  }

  // Execute sale transaction
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Lock and inspect all referenced batches in medicinebatch FOR UPDATE
    const batchIds = itemsToProcess.map(it => it.batchId);
    const [batchRows] = await connection.query(
      `SELECT 
        b.batch_id, 
        b.medicine_id, 
        b.batch_number, 
        b.quantity, 
        b.unit_price, 
        b.expiry_date,
        m.medicine_name
       FROM medicinebatch b
       JOIN medicine m ON b.medicine_id = m.medicine_id
       WHERE b.batch_id IN (?)
       FOR UPDATE`,
      [batchIds]
    );

    const batchMap = new Map();
    for (const b of batchRows) {
      batchMap.set(b.batch_id, b);
    }

    // Verify all requested batches exist
    for (const item of itemsToProcess) {
      if (!batchMap.has(item.batchId)) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          error: `Medicine batch with ID ${item.batchId} does not exist in inventory.`
        });
      }
    }

    // Check expiration and stock for each batch
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const item of itemsToProcess) {
      const b = batchMap.get(item.batchId);

      // Check clinical expiration
      const expDate = new Date(b.expiry_date);
      if (expDate < today) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          error: `Clinical safety violation: Batch #${b.batch_number} (${b.medicine_name}) is EXPIRED (expired on ${b.expiry_date.toISOString().slice(0, 10)}) and cannot be dispensed.`
        });
      }

      // Check stock sufficiency
      if (b.quantity < item.quantity) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          error: `Insufficient stock for batch #${b.batch_number} (${b.medicine_name}). Available: ${b.quantity} unit(s), Requested: ${item.quantity} unit(s).`,
          details: {
            batchId: b.batch_id,
            batchNumber: b.batch_number,
            availableStock: b.quantity,
            requestedQuantity: item.quantity
          }
        });
      }
    }

    // 2. Insert Sale master record
    // IMPORTANT: total_amount is inserted as 0.00 because trigger after_saleitem_insert
    // automatically adds (NEW.quantity * NEW.unit_price) for each item!
    const insertSaleSql = formattedSaleDate
      ? 'INSERT INTO sale (patient_id, sale_date, total_amount) VALUES (?, ?, 0.00)'
      : 'INSERT INTO sale (patient_id, sale_date, total_amount) VALUES (?, CURDATE(), 0.00)';
    const insertSaleParams = formattedSaleDate
      ? [validatedPatientId, formattedSaleDate]
      : [validatedPatientId];

    const [saleResult] = await connection.query(insertSaleSql, insertSaleParams);
    const newSaleId = saleResult.insertId;

    // 3. Insert each SaleItem record
    // Using trusted unit_price directly from database (batchMap)
    // Triggers will automatically:
    // - validate stock (check_sale_stock)
    // - deduct stock in MedicineBatch (after_saleitem_insert)
    // - accumulate total_amount in Sale (after_saleitem_insert)
    const insertedItemsDetail = [];
    for (const item of itemsToProcess) {
      const b = batchMap.get(item.batchId);
      const trustedUnitPrice = parseFloat(b.unit_price);
      const subtotal = parseFloat((trustedUnitPrice * item.quantity).toFixed(2));

      await connection.query(
        'INSERT INTO saleitem (sale_id, batch_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [newSaleId, item.batchId, item.quantity, trustedUnitPrice]
      );

      insertedItemsDetail.push({
        batchId: b.batch_id,
        batchNumber: b.batch_number,
        medicineName: b.medicine_name,
        quantity: item.quantity,
        unitPrice: trustedUnitPrice,
        subtotal
      });
    }

    // 4. Retrieve final verified total_amount calculated by after_saleitem_insert trigger
    const [[finalSaleRow]] = await connection.query(
      'SELECT total_amount, DATE_FORMAT(sale_date, "%Y-%m-%d") AS saleDate FROM sale WHERE sale_id = ?',
      [newSaleId]
    );

    // Commit transaction only if every item and trigger succeeded
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Sale transaction completed and recorded successfully.',
      data: {
        saleId: newSaleId,
        invoiceNumber: `INV-2026-${String(newSaleId).padStart(4, '0')}`,
        date: finalSaleRow.saleDate,
        patientId: validatedPatientId,
        totalAmount: parseFloat(finalSaleRow.total_amount),
        itemsCount: insertedItemsDetail.length,
        items: insertedItemsDetail
      }
    });

  } catch (txError) {
    // Roll back transaction on ANY failure
    try {
      await connection.rollback();
    } catch (rbErr) {
      console.error('Error during rollback:', rbErr.message);
    }

    console.error('Sale transaction failed:', txError.message);

    // Handle trigger exception (e.g. check_sale_stock signal)
    if (txError.sqlState === '45000' || txError.code === 'ER_SIGNAL_EXCEPTION') {
      return res.status(409).json({
        success: false,
        error: `Database Stock Trigger: ${txError.sqlMessage || 'Insufficient stock available'}`,
        sqlState: txError.sqlState
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Sale transaction failed. All changes have been safely rolled back.',
      details: txError.message
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
