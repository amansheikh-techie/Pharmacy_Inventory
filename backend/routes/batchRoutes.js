// =====================================================================
// Batch Inventory & Expiry Traceability Routes
// Uses verified MySQL 8.0 schema from pharmacy_db:
// - medicinebatch (batch_id, medicine_id, batch_number, quantity, unit_price, expiry_date)
// - medicine (medicine_id, medicine_name, category_id, manufacturer)
// - category (category_id, category_name)
// =====================================================================

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * Helper to compute batch status tag from stock and daysToExpiry
 */
function computeBatchStatus(quantity, daysToExpiry, reorderLevel = 30) {
  if (daysToExpiry < 0) {
    return { type: 'expired', label: 'Expired Batch' };
  }
  if (daysToExpiry <= 30) {
    return { type: 'warning', label: `Expiring Soon (${daysToExpiry}d)` };
  }
  if (quantity <= reorderLevel) {
    return { type: 'low-stock', label: `Low Stock (${quantity} left)` };
  }
  return { type: 'in-stock', label: 'Good / In Stock' };
}

/**
 * GET /api/batches
 * Retrieves all medicine batches joined with medicine name and category.
 * Supports optional filters: ?search=... & ?status=... & ?medicineId=...
 */
router.get('/', async (req, res) => {
  try {
    const { search, status, medicineId } = req.query;

    let query = `
      SELECT 
        b.batch_id AS id,
        b.medicine_id AS medicineId,
        m.medicine_name AS medicineName,
        m.manufacturer AS manufacturer,
        COALESCE(c.category_name, 'Uncategorized') AS categoryName,
        b.batch_number AS batchNumber,
        b.quantity AS stock,
        CAST(b.unit_price AS DECIMAL(10,2)) AS unitPrice,
        CAST(b.unit_price AS DECIMAL(10,2)) AS sellingPrice,
        DATE_FORMAT(b.expiry_date, '%Y-%m-%d') AS expiryDate,
        DATEDIFF(b.expiry_date, CURDATE()) AS daysToExpiry,
        30 AS reorderLevel
      FROM medicinebatch b
      JOIN medicine m ON b.medicine_id = m.medicine_id
      LEFT JOIN category c ON m.category_id = c.category_id
    `;

    const whereClauses = [];
    const params = [];

    // Search filter: batch number, medicine name, or manufacturer
    if (search && search.trim() !== '') {
      whereClauses.push('(b.batch_number LIKE ? OR m.medicine_name LIKE ? OR m.manufacturer LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    // Medicine filter
    if (medicineId) {
      const parsedMedId = parseInt(medicineId, 10);
      if (!isNaN(parsedMedId)) {
        whereClauses.push('b.medicine_id = ?');
        params.push(parsedMedId);
      }
    }

    // Status filter directly in SQL when possible
    if (status) {
      if (status === 'expired') {
        whereClauses.push('b.expiry_date < CURDATE()');
      } else if (status === 'warning') {
        whereClauses.push('b.expiry_date >= CURDATE() AND b.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)');
      } else if (status === 'low-stock') {
        whereClauses.push('b.quantity <= 30 AND b.expiry_date >= CURDATE()');
      } else if (status === 'in-stock') {
        whereClauses.push('b.quantity > 30 AND b.expiry_date > DATE_ADD(CURDATE(), INTERVAL 30 DAY)');
      }
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    // FEFO: First-Expiry, First-Out principle (sort by earliest expiry date)
    query += ' ORDER BY b.expiry_date ASC, m.medicine_name ASC;';

    const [rows] = await pool.query(query, params);

    // Format rows with status metadata
    const formattedRows = rows.map(b => {
      const statusMeta = computeBatchStatus(b.stock, b.daysToExpiry, b.reorderLevel);
      return {
        ...b,
        statusType: statusMeta.type,
        statusLabel: statusMeta.label
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedRows.length,
      data: formattedRows
    });
  } catch (error) {
    console.error('Error fetching batches from MySQL:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve batches from database.',
      details: error.message
    });
  }
});

/**
 * GET /api/batches/:id
 * Retrieves a single batch by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const batchId = parseInt(req.params.id, 10);
    if (isNaN(batchId) || batchId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid batch ID. Must be a positive integer.'
      });
    }

    const query = `
      SELECT 
        b.batch_id AS id,
        b.medicine_id AS medicineId,
        m.medicine_name AS medicineName,
        m.manufacturer AS manufacturer,
        COALESCE(c.category_name, 'Uncategorized') AS categoryName,
        b.batch_number AS batchNumber,
        b.quantity AS stock,
        CAST(b.unit_price AS DECIMAL(10,2)) AS unitPrice,
        CAST(b.unit_price AS DECIMAL(10,2)) AS sellingPrice,
        DATE_FORMAT(b.expiry_date, '%Y-%m-%d') AS expiryDate,
        DATEDIFF(b.expiry_date, CURDATE()) AS daysToExpiry,
        30 AS reorderLevel
      FROM medicinebatch b
      JOIN medicine m ON b.medicine_id = m.medicine_id
      LEFT JOIN category c ON m.category_id = c.category_id
      WHERE b.batch_id = ?
    `;

    const [rows] = await pool.query(query, [batchId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Batch with ID ${batchId} not found.`
      });
    }

    const b = rows[0];
    const statusMeta = computeBatchStatus(b.stock, b.daysToExpiry, b.reorderLevel);

    return res.status(200).json({
      success: true,
      data: {
        ...b,
        statusType: statusMeta.type,
        statusLabel: statusMeta.label
      }
    });
  } catch (error) {
    console.error('Error fetching batch by ID:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve batch from database.',
      details: error.message
    });
  }
});

/**
 * POST /api/batches
 * Creates a new batch record for an existing medicine
 */
router.post('/', async (req, res) => {
  try {
    const {
      medicineId,
      medicine_id,
      batchNumber,
      batch_number,
      quantity,
      stock,
      unitPrice,
      unit_price,
      sellingPrice,
      expiryDate,
      expiry_date
    } = req.body;

    // Normalize field inputs
    const rawMedId = medicineId !== undefined ? medicineId : medicine_id;
    const rawBatchNum = batchNumber !== undefined ? batchNumber : batch_number;
    const rawQty = quantity !== undefined ? quantity : stock;
    const rawPrice = unitPrice !== undefined ? unitPrice : (unit_price !== undefined ? unit_price : sellingPrice);
    const rawExpiry = expiryDate !== undefined ? expiryDate : expiry_date;

    // 1. Validate medicineId
    const parsedMedId = parseInt(rawMedId, 10);
    if (isNaN(parsedMedId) || parsedMedId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'A valid medicine ID is required.'
      });
    }

    // Verify medicine exists in MySQL
    const [medRows] = await pool.query('SELECT medicine_id, medicine_name FROM medicine WHERE medicine_id = ?', [parsedMedId]);
    if (medRows.length === 0) {
      return res.status(400).json({
        success: false,
        error: `Referenced medicine (ID: ${parsedMedId}) does not exist in database.`
      });
    }

    // 2. Validate batchNumber
    if (!rawBatchNum || typeof rawBatchNum !== 'string' || rawBatchNum.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Batch number is required.'
      });
    }
    const trimmedBatchNum = rawBatchNum.trim().toUpperCase();
    if (trimmedBatchNum.length > 30) {
      return res.status(400).json({
        success: false,
        error: 'Batch number must be 30 characters or fewer.'
      });
    }

    // 3. Validate quantity
    const parsedQty = parseInt(rawQty, 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a non-negative integer.'
      });
    }

    // 4. Validate unit price
    const parsedPrice = parseFloat(rawPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Unit price must be a non-negative number.'
      });
    }

    // 5. Validate expiry date
    if (!rawExpiry || isNaN(Date.parse(rawExpiry))) {
      return res.status(400).json({
        success: false,
        error: 'A valid expiry date is required (format: YYYY-MM-DD).'
      });
    }
    const formattedExpiry = new Date(rawExpiry).toISOString().slice(0, 10);

    // 6. Parameterized Insert
    const insertQuery = `
      INSERT INTO medicinebatch (medicine_id, batch_number, quantity, unit_price, expiry_date)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(insertQuery, [
      parsedMedId,
      trimmedBatchNum,
      parsedQty,
      parsedPrice,
      formattedExpiry
    ]);

    const createdId = result.insertId;

    // Fetch created record joined with medicine name
    const [newRow] = await pool.query(
      `SELECT 
        b.batch_id AS id,
        b.medicine_id AS medicineId,
        m.medicine_name AS medicineName,
        m.manufacturer AS manufacturer,
        COALESCE(c.category_name, 'Uncategorized') AS categoryName,
        b.batch_number AS batchNumber,
        b.quantity AS stock,
        CAST(b.unit_price AS DECIMAL(10,2)) AS unitPrice,
        CAST(b.unit_price AS DECIMAL(10,2)) AS sellingPrice,
        DATE_FORMAT(b.expiry_date, '%Y-%m-%d') AS expiryDate,
        DATEDIFF(b.expiry_date, CURDATE()) AS daysToExpiry,
        30 AS reorderLevel
      FROM medicinebatch b
      JOIN medicine m ON b.medicine_id = m.medicine_id
      LEFT JOIN category c ON m.category_id = c.category_id
      WHERE b.batch_id = ?`,
      [createdId]
    );

    const b = newRow[0];
    const statusMeta = computeBatchStatus(b.stock, b.daysToExpiry, b.reorderLevel);

    return res.status(201).json({
      success: true,
      message: `Batch #${trimmedBatchNum} registered successfully.`,
      data: {
        ...b,
        statusType: statusMeta.type,
        statusLabel: statusMeta.label
      }
    });
  } catch (error) {
    console.error('Error creating batch in MySQL:', error.message);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Duplicate batch number: A batch with this number already exists.'
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        error: 'Referenced medicine does not exist.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create batch in database.',
      details: error.message
    });
  }
});

/**
 * PUT /api/batches/:id
 * Updates an existing batch's quantity, price, and expiry date
 */
router.put('/:id', async (req, res) => {
  try {
    const batchId = parseInt(req.params.id, 10);
    if (isNaN(batchId) || batchId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid batch ID. Must be a positive integer.'
      });
    }

    // Verify batch exists
    const [existing] = await pool.query('SELECT batch_id, medicine_id, batch_number, quantity, unit_price, expiry_date FROM medicinebatch WHERE batch_id = ?', [batchId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Batch with ID ${batchId} not found.`
      });
    }

    const current = existing[0];
    const {
      batchNumber,
      batch_number,
      quantity,
      stock,
      unitPrice,
      unit_price,
      sellingPrice,
      expiryDate,
      expiry_date
    } = req.body;

    // Validate batchNumber if changing
    let updatedBatchNum = current.batch_number;
    const rawBatchNum = batchNumber !== undefined ? batchNumber : batch_number;
    if (rawBatchNum !== undefined) {
      if (typeof rawBatchNum !== 'string' || rawBatchNum.trim() === '') {
        return res.status(400).json({ success: false, error: 'Batch number cannot be empty.' });
      }
      updatedBatchNum = rawBatchNum.trim().toUpperCase();
      if (updatedBatchNum.length > 30) {
        return res.status(400).json({ success: false, error: 'Batch number must be 30 characters or fewer.' });
      }
    }

    // Validate quantity
    let updatedQty = current.quantity;
    const rawQty = quantity !== undefined ? quantity : stock;
    if (rawQty !== undefined) {
      const parsedQty = parseInt(rawQty, 10);
      if (isNaN(parsedQty) || parsedQty < 0) {
        return res.status(400).json({ success: false, error: 'Quantity must be a non-negative integer.' });
      }
      updatedQty = parsedQty;
    }

    // Validate unit price
    let updatedPrice = current.unit_price;
    const rawPrice = unitPrice !== undefined ? unitPrice : (unit_price !== undefined ? unit_price : sellingPrice);
    if (rawPrice !== undefined) {
      const parsedPrice = parseFloat(rawPrice);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ success: false, error: 'Unit price must be a non-negative number.' });
      }
      updatedPrice = parsedPrice;
    }

    // Validate expiry date
    let updatedExpiry = current.expiry_date;
    const rawExpiry = expiryDate !== undefined ? expiryDate : expiry_date;
    if (rawExpiry !== undefined) {
      if (!rawExpiry || isNaN(Date.parse(rawExpiry))) {
        return res.status(400).json({ success: false, error: 'A valid expiry date is required (YYYY-MM-DD).' });
      }
      updatedExpiry = new Date(rawExpiry).toISOString().slice(0, 10);
    }

    // Parameterized update
    await pool.query(
      'UPDATE medicinebatch SET batch_number = ?, quantity = ?, unit_price = ?, expiry_date = ? WHERE batch_id = ?',
      [updatedBatchNum, updatedQty, updatedPrice, updatedExpiry, batchId]
    );

    // Fetch updated record
    const [updatedRow] = await pool.query(
      `SELECT 
        b.batch_id AS id,
        b.medicine_id AS medicineId,
        m.medicine_name AS medicineName,
        m.manufacturer AS manufacturer,
        COALESCE(c.category_name, 'Uncategorized') AS categoryName,
        b.batch_number AS batchNumber,
        b.quantity AS stock,
        CAST(b.unit_price AS DECIMAL(10,2)) AS unitPrice,
        CAST(b.unit_price AS DECIMAL(10,2)) AS sellingPrice,
        DATE_FORMAT(b.expiry_date, '%Y-%m-%d') AS expiryDate,
        DATEDIFF(b.expiry_date, CURDATE()) AS daysToExpiry,
        30 AS reorderLevel
      FROM medicinebatch b
      JOIN medicine m ON b.medicine_id = m.medicine_id
      LEFT JOIN category c ON m.category_id = c.category_id
      WHERE b.batch_id = ?`,
      [batchId]
    );

    const b = updatedRow[0];
    const statusMeta = computeBatchStatus(b.stock, b.daysToExpiry, b.reorderLevel);

    return res.status(200).json({
      success: true,
      message: `Batch #${updatedBatchNum} updated successfully.`,
      data: {
        ...b,
        statusType: statusMeta.type,
        statusLabel: statusMeta.label
      }
    });
  } catch (error) {
    console.error('Error updating batch in MySQL:', error.message);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Duplicate batch number: A batch with this number already exists.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to update batch in database.',
      details: error.message
    });
  }
});

/**
 * DELETE /api/batches/:id
 * Deletes a batch from MySQL if not linked to any sales records
 */
router.delete('/:id', async (req, res) => {
  try {
    const batchId = parseInt(req.params.id, 10);
    if (isNaN(batchId) || batchId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid batch ID. Must be a positive integer.'
      });
    }

    // Verify batch exists
    const [existing] = await pool.query('SELECT batch_id, batch_number FROM medicinebatch WHERE batch_id = ?', [batchId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Batch with ID ${batchId} not found.`
      });
    }

    // Check if linked to sale items
    const [sales] = await pool.query('SELECT sale_item_id FROM saleitem WHERE batch_id = ? LIMIT 1', [batchId]);
    if (sales.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete batch #${existing[0].batch_number} because it has historical sales/billing transactions associated with it.`
      });
    }

    await pool.query('DELETE FROM medicinebatch WHERE batch_id = ?', [batchId]);

    return res.status(200).json({
      success: true,
      message: `Batch #${existing[0].batch_number} deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting batch:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete batch from database.',
      details: error.message
    });
  }
});

module.exports = router;
