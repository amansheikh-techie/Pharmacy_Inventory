// =====================================================================
// Doctor API Routes (Phase 4D)
// Uses actual MySQL schema: doctor (doctor_id, doctor_name, specialization)
// =====================================================================

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/doctors
 * Returns prescribing doctors for prescription creation and clinical workflows.
 * Fields: id, name, specialization
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        doctor_id AS id,
        doctor_name AS name,
        COALESCE(specialization, 'General Physician') AS specialization
      FROM doctor
      ORDER BY doctor_name ASC;
    `;
    const [rows] = await pool.query(query);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching doctors from MySQL:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve doctor registry',
      details: error.message
    });
  }
});

module.exports = router;
