// =====================================================================
// Phase 3C: Medicine API Routes
// Uses verified MySQL 8.0 schema from pharmacy_db:
// - medicine (medicine_id, medicine_name, category_id, manufacturer)
// - category (category_id, category_name)
// - medicinebatch (batch_id, medicine_id, batch_number, quantity, unit_price, expiry_date)
// =====================================================================

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/medicines
 * Retrieves real medicine records joined with category and aggregated batch stock.
 * Supports optional query params: ?search=... & ?category=...
 */
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = `
      SELECT 
        m.medicine_id AS id,
        m.medicine_name AS name,
        m.manufacturer AS manufacturer,
        m.category_id AS categoryId,
        COALESCE(c.category_name, 'Uncategorized') AS categoryName,
        CAST(COALESCE(SUM(b.quantity), 0) AS UNSIGNED) AS totalStock,
        COUNT(b.batch_id) AS batchCount
      FROM medicine m
      LEFT JOIN category c ON m.category_id = c.category_id
      LEFT JOIN medicinebatch b ON m.medicine_id = b.medicine_id
    `;

    const whereClauses = [];
    const params = [];

    // Parameterized search filter (prevents SQL injection)
    if (search && search.trim() !== '') {
      whereClauses.push('(m.medicine_name LIKE ? OR m.manufacturer LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    // Parameterized category filter
    if (category && category.trim() !== '') {
      whereClauses.push('m.category_id = ?');
      params.push(parseInt(category, 10));
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += `
      GROUP BY m.medicine_id, m.medicine_name, m.manufacturer, m.category_id, c.category_name
      ORDER BY m.medicine_name ASC;
    `;

    // Execute parameterized query against MySQL
    const [rows] = await pool.query(query, params);

    // Return consistent JSON response
    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching medicines from MySQL:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve medicines from database.',
      details: error.message
    });
  }
});

/**
 * GET /api/medicines/categories
 * Helper endpoint to fetch real categories from MySQL for the filter dropdown
 */
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT category_id AS id, category_name AS name FROM category ORDER BY category_name ASC;');
    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching categories from MySQL:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve categories from database.',
      details: error.message
    });
  }
});

/**
 * GET /api/medicines/:id
 * Fetches a single medicine by ID with category and batch details
 */
router.get('/:id', async (req, res) => {
  try {
    const medicineId = parseInt(req.params.id, 10);
    if (isNaN(medicineId) || medicineId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid medicine ID. Must be a positive integer.'
      });
    }

    const [rows] = await pool.query(
      `SELECT 
        m.medicine_id AS id,
        m.medicine_name AS name,
        m.manufacturer AS manufacturer,
        m.category_id AS categoryId,
        COALESCE(c.category_name, 'Uncategorized') AS categoryName,
        CAST(COALESCE(SUM(b.quantity), 0) AS UNSIGNED) AS totalStock,
        COUNT(b.batch_id) AS batchCount
      FROM medicine m
      LEFT JOIN category c ON m.category_id = c.category_id
      LEFT JOIN medicinebatch b ON m.medicine_id = b.medicine_id
      WHERE m.medicine_id = ?
      GROUP BY m.medicine_id, m.medicine_name, m.manufacturer, m.category_id, c.category_name`,
      [medicineId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Medicine with ID ${medicineId} not found.`
      });
    }

    const [batches] = await pool.query(
      `SELECT 
        batch_id AS id,
        batch_number AS batchNumber,
        quantity,
        unit_price AS unitPrice,
        expiry_date AS expiryDate
      FROM medicinebatch
      WHERE medicine_id = ?
      ORDER BY expiry_date ASC`,
      [medicineId]
    );

    const medData = rows[0];
    medData.batches = batches;

    return res.status(200).json({
      success: true,
      data: medData
    });
  } catch (error) {
    console.error('Error fetching medicine by ID:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve medicine from database.',
      details: error.message
    });
  }
});

/**
 * POST /api/medicines
 * Creates a new medicine record in MySQL.
 * Optionally supports adding an initial batch in the same transaction.
 */
router.post('/', async (req, res) => {
  let connection;
  try {
    const {
      name,
      medicine_name,
      categoryId,
      category_id,
      manufacturer,
      generic,
      // Optional initial batch fields
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

    // Normalize field names
    const rawName = (name !== undefined ? name : medicine_name);
    const rawCatId = (categoryId !== undefined ? categoryId : category_id);
    const rawMfr = (manufacturer !== undefined ? manufacturer : (generic !== undefined ? generic : null));

    // 1. Validate required fields
    if (!rawName || typeof rawName !== 'string' || rawName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Medicine name is required and cannot be empty.'
      });
    }

    const trimmedName = rawName.trim();
    if (trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Medicine name must be 100 characters or fewer.'
      });
    }

    // 2. Validate manufacturer if provided
    let trimmedMfr = null;
    if (rawMfr !== null && rawMfr !== undefined && rawMfr !== '') {
      if (typeof rawMfr !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Manufacturer must be a string.'
        });
      }
      trimmedMfr = rawMfr.trim();
      if (trimmedMfr.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Manufacturer must be 100 characters or fewer.'
        });
      }
    }

    // 3. Validate category if provided
    let parsedCategoryId = null;
    if (rawCatId !== null && rawCatId !== undefined && rawCatId !== '') {
      parsedCategoryId = parseInt(rawCatId, 10);
      if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Category ID must be a positive integer.'
        });
      }

      // Check referenced category exists in MySQL
      const [catRows] = await pool.query(
        'SELECT category_id, category_name FROM category WHERE category_id = ?',
        [parsedCategoryId]
      );

      if (catRows.length === 0) {
        return res.status(400).json({
          success: false,
          error: `Referenced category (category_id: ${parsedCategoryId}) does not exist.`
        });
      }
    }

    // 4. Validate optional batch fields if provided
    const rawBatchNumber = batchNumber || batch_number;
    const rawQty = (quantity !== undefined ? quantity : stock);
    const rawPrice = (unitPrice !== undefined ? unitPrice : (unit_price !== undefined ? unit_price : sellingPrice));
    const rawExpiry = expiryDate || expiry_date;

    const hasBatchInfo = rawBatchNumber || rawQty !== undefined || rawPrice !== undefined || rawExpiry;
    let parsedBatch = null;

    if (hasBatchInfo) {
      if (!rawBatchNumber || typeof rawBatchNumber !== 'string' || rawBatchNumber.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Batch number is required when batch details are provided.'
        });
      }
      const trimmedBatchNumber = rawBatchNumber.trim();
      if (trimmedBatchNumber.length > 30) {
        return res.status(400).json({
          success: false,
          error: 'Batch number must be 30 characters or fewer.'
        });
      }

      const parsedQty = parseInt(rawQty, 10);
      if (isNaN(parsedQty) || parsedQty < 0) {
        return res.status(400).json({
          success: false,
          error: 'Batch quantity must be a non-negative integer.'
        });
      }

      const parsedPrice = parseFloat(rawPrice);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          error: 'Batch unit price must be a non-negative number.'
        });
      }

      if (!rawExpiry || isNaN(Date.parse(rawExpiry))) {
        return res.status(400).json({
          success: false,
          error: 'A valid expiry date is required (e.g. YYYY-MM-DD).'
        });
      }

      parsedBatch = {
        batchNumber: trimmedBatchNumber,
        quantity: parsedQty,
        unitPrice: parsedPrice,
        expiryDate: new Date(rawExpiry).toISOString().slice(0, 10)
      };
    }

    // 5. Execute parameterized insert(s)
    connection = await pool.getConnection();

    if (parsedBatch) {
      await connection.beginTransaction();

      const [medResult] = await connection.query(
        'INSERT INTO medicine (medicine_name, category_id, manufacturer) VALUES (?, ?, ?)',
        [trimmedName, parsedCategoryId, trimmedMfr]
      );
      const newMedId = medResult.insertId;

      const [batchResult] = await connection.query(
        'INSERT INTO medicinebatch (medicine_id, batch_number, quantity, unit_price, expiry_date) VALUES (?, ?, ?, ?, ?)',
        [newMedId, parsedBatch.batchNumber, parsedBatch.quantity, parsedBatch.unitPrice, parsedBatch.expiryDate]
      );

      await connection.commit();

      // Retrieve full joined created record
      const [newRow] = await connection.query(
        `SELECT 
          m.medicine_id AS id,
          m.medicine_name AS name,
          m.manufacturer AS manufacturer,
          m.category_id AS categoryId,
          COALESCE(c.category_name, 'Uncategorized') AS categoryName,
          CAST(COALESCE(SUM(b.quantity), 0) AS UNSIGNED) AS totalStock,
          COUNT(b.batch_id) AS batchCount
        FROM medicine m
        LEFT JOIN category c ON m.category_id = c.category_id
        LEFT JOIN medicinebatch b ON m.medicine_id = b.medicine_id
        WHERE m.medicine_id = ?
        GROUP BY m.medicine_id, m.medicine_name, m.manufacturer, m.category_id, c.category_name`,
        [newMedId]
      );

      return res.status(201).json({
        success: true,
        message: 'Medicine and initial batch registered successfully.',
        data: {
          ...newRow[0],
          initialBatch: {
            id: batchResult.insertId,
            batchNumber: parsedBatch.batchNumber,
            quantity: parsedBatch.quantity,
            unitPrice: parsedBatch.unitPrice,
            expiryDate: parsedBatch.expiryDate
          }
        }
      });
    } else {
      const [medResult] = await connection.query(
        'INSERT INTO medicine (medicine_name, category_id, manufacturer) VALUES (?, ?, ?)',
        [trimmedName, parsedCategoryId, trimmedMfr]
      );
      const newMedId = medResult.insertId;

      const [newRow] = await connection.query(
        `SELECT 
          m.medicine_id AS id,
          m.medicine_name AS name,
          m.manufacturer AS manufacturer,
          m.category_id AS categoryId,
          COALESCE(c.category_name, 'Uncategorized') AS categoryName,
          0 AS totalStock,
          0 AS batchCount
        FROM medicine m
        LEFT JOIN category c ON m.category_id = c.category_id
        WHERE m.medicine_id = ?`,
        [newMedId]
      );

      return res.status(201).json({
        success: true,
        message: 'Medicine registered successfully.',
        data: newRow[0]
      });
    }
  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch (_) {}
    }
    console.error('Error adding medicine to MySQL:', error.message);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Duplicate entry: A record with this unique value (e.g. batch number) already exists.'
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        error: 'Database constraint error: Referenced category does not exist.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create medicine record in database.',
      details: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * PUT /api/medicines/:id
 * Updates an existing medicine record in MySQL.
 */
router.put('/:id', async (req, res) => {
  try {
    const medicineId = parseInt(req.params.id, 10);
    if (isNaN(medicineId) || medicineId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid medicine ID. Must be a positive integer.'
      });
    }

    // 1. Confirm that the medicine exists
    const [existing] = await pool.query(
      'SELECT medicine_id, medicine_name, category_id, manufacturer FROM medicine WHERE medicine_id = ?',
      [medicineId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Medicine with ID ${medicineId} not found.`
      });
    }

    const {
      name,
      medicine_name,
      categoryId,
      category_id,
      manufacturer,
      generic
    } = req.body;

    // Normalize inputs
    const rawName = (name !== undefined ? name : medicine_name);
    const rawCatId = (categoryId !== undefined ? categoryId : category_id);
    const rawMfr = (manufacturer !== undefined ? manufacturer : (generic !== undefined ? generic : undefined));

    // 2. Validate updated name
    let updatedName = existing[0].medicine_name;
    if (rawName !== undefined) {
      if (typeof rawName !== 'string' || rawName.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Medicine name cannot be empty.'
        });
      }
      updatedName = rawName.trim();
      if (updatedName.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Medicine name must be 100 characters or fewer.'
        });
      }
    }

    // 3. Validate updated category
    let updatedCatId = existing[0].category_id;
    if (rawCatId !== undefined) {
      if (rawCatId === null || rawCatId === '') {
        updatedCatId = null;
      } else {
        const parsedCat = parseInt(rawCatId, 10);
        if (isNaN(parsedCat) || parsedCat <= 0) {
          return res.status(400).json({
            success: false,
            error: 'Category ID must be a positive integer.'
          });
        }
        // Verify category exists
        const [catRows] = await pool.query(
          'SELECT category_id FROM category WHERE category_id = ?',
          [parsedCat]
        );
        if (catRows.length === 0) {
          return res.status(400).json({
            success: false,
            error: `Referenced category (category_id: ${parsedCat}) does not exist.`
          });
        }
        updatedCatId = parsedCat;
      }
    }

    // 4. Validate updated manufacturer
    let updatedMfr = existing[0].manufacturer;
    if (rawMfr !== undefined) {
      if (rawMfr === null || rawMfr === '') {
        updatedMfr = null;
      } else {
        if (typeof rawMfr !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'Manufacturer must be a string.'
          });
        }
        updatedMfr = rawMfr.trim();
        if (updatedMfr.length > 100) {
          return res.status(400).json({
            success: false,
            error: 'Manufacturer must be 100 characters or fewer.'
          });
        }
      }
    }

    // 5. Parameterized Update against MySQL
    await pool.query(
      'UPDATE medicine SET medicine_name = ?, category_id = ?, manufacturer = ? WHERE medicine_id = ?',
      [updatedName, updatedCatId, updatedMfr, medicineId]
    );

    // Fetch updated record with category and batch stats
    const [updatedRow] = await pool.query(
      `SELECT 
        m.medicine_id AS id,
        m.medicine_name AS name,
        m.manufacturer AS manufacturer,
        m.category_id AS categoryId,
        COALESCE(c.category_name, 'Uncategorized') AS categoryName,
        CAST(COALESCE(SUM(b.quantity), 0) AS UNSIGNED) AS totalStock,
        COUNT(b.batch_id) AS batchCount
      FROM medicine m
      LEFT JOIN category c ON m.category_id = c.category_id
      LEFT JOIN medicinebatch b ON m.medicine_id = b.medicine_id
      WHERE m.medicine_id = ?
      GROUP BY m.medicine_id, m.medicine_name, m.manufacturer, m.category_id, c.category_name`,
      [medicineId]
    );

    return res.status(200).json({
      success: true,
      message: 'Medicine updated successfully.',
      data: updatedRow[0]
    });
  } catch (error) {
    console.error('Error updating medicine in MySQL:', error.message);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Duplicate entry: An identical record already exists.'
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        error: 'Database constraint error: Referenced category does not exist.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to update medicine in database.',
      details: error.message
    });
  }
});

module.exports = router;
