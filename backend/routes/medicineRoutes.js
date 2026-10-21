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

module.exports = router;
