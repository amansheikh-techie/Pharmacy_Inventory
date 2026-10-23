// =====================================================================
// Patient API Routes (Phase 4D)
// Uses actual MySQL schema: patient (patient_id, patient_name, phone)
// Avoids exposing unnecessary personal or sensitive information
// =====================================================================

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/patients
 * Returns the patient fields needed for prescription and clinical records.
 * Fields: id, name, phone
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        patient_id AS id,
        patient_name AS name,
        phone
      FROM patient
      ORDER BY patient_name ASC;
    `;
    const [rows] = await pool.query(query);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching patients from MySQL:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve patient registry',
      details: error.message
    });
  }
});

module.exports = router;
