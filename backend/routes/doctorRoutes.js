// =====================================================================
// Doctor API Routes (Phase 4E)
// Uses actual MySQL schema: doctor (doctor_id, doctor_name, specialization)
// =====================================================================

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/doctors
 * Returns prescribing doctors for prescription creation and clinical workflows.
 * Supports search via ?search=
 * Fields: id, name, specialization
 */
router.get('/', async (req, res) => {
  try {
    const search = (req.query.search || '').trim().toLowerCase();

    let query = `
      SELECT 
        doctor_id AS id,
        doctor_name AS name,
        COALESCE(specialization, 'General Physician') AS specialization
      FROM doctor
    `;
    const params = [];

    if (search) {
      query += ` WHERE LOWER(doctor_name) LIKE ? OR LOWER(specialization) LIKE ?`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    query += ` ORDER BY doctor_name ASC;`;

    const [rows] = await pool.query(query, params);

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

/**
 * GET /api/doctors/:id
 * Returns a single doctor record by ID.
 */
router.get('/:id', async (req, res) => {
  const doctorId = parseInt(req.params.id, 10);
  if (isNaN(doctorId) || doctorId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid doctor ID. Must be a positive integer.'
    });
  }

  try {
    const query = `
      SELECT 
        doctor_id AS id,
        doctor_name AS name,
        COALESCE(specialization, 'General Physician') AS specialization
      FROM doctor
      WHERE doctor_id = ?;
    `;
    const [rows] = await pool.query(query, [doctorId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Doctor #${doctorId} not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching doctor by ID:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve doctor details',
      details: error.message
    });
  }
});

/**
 * POST /api/doctors
 * Adds a new doctor using supported schema fields: doctor_name, specialization.
 */
router.post('/', async (req, res) => {
  try {
    const rawName = req.body.name || req.body.doctor_name;
    const name = typeof rawName === 'string' ? rawName.trim() : '';
    const rawSpec = req.body.specialization;
    const specialization = typeof rawSpec === 'string' ? rawSpec.trim() : (rawSpec ? String(rawSpec).trim() : 'General Physician');

    // Validation: doctor_name is NOT NULL in schema
    if (!name || name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Doctor name is required (between 2 and 100 characters).'
      });
    }

    if (specialization && specialization.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Specialization must not exceed 100 characters.'
      });
    }

    const insertQuery = `
      INSERT INTO doctor (doctor_name, specialization)
      VALUES (?, ?);
    `;
    const [result] = await pool.query(insertQuery, [name, specialization || 'General Physician']);

    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully in MySQL.',
      data: {
        id: result.insertId,
        name: name,
        specialization: specialization || 'General Physician'
      }
    });
  } catch (error) {
    console.error('Error creating doctor in MySQL:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to register doctor in database.',
      details: error.message
    });
  }
});

/**
 * PUT /api/doctors/:id
 * Updates an existing doctor record using supported schema fields.
 */
router.put('/:id', async (req, res) => {
  const doctorId = parseInt(req.params.id, 10);
  if (isNaN(doctorId) || doctorId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid doctor ID. Must be a positive integer.'
    });
  }

  try {
    // Confirm doctor exists
    const [existing] = await pool.query('SELECT doctor_id FROM doctor WHERE doctor_id = ?;', [doctorId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Doctor #${doctorId} not found.`
      });
    }

    const rawName = req.body.name || req.body.doctor_name;
    const name = typeof rawName === 'string' ? rawName.trim() : '';
    const rawSpec = req.body.specialization;
    const specialization = typeof rawSpec === 'string' ? rawSpec.trim() : (rawSpec ? String(rawSpec).trim() : 'General Physician');

    if (!name || name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Doctor name is required (between 2 and 100 characters).'
      });
    }

    if (specialization && specialization.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Specialization must not exceed 100 characters.'
      });
    }

    const updateQuery = `
      UPDATE doctor 
      SET doctor_name = ?, specialization = ?
      WHERE doctor_id = ?;
    `;
    await pool.query(updateQuery, [name, specialization || 'General Physician', doctorId]);

    res.status(200).json({
      success: true,
      message: 'Doctor record updated successfully.',
      data: {
        id: doctorId,
        name: name,
        specialization: specialization || 'General Physician'
      }
    });
  } catch (error) {
    console.error('Error updating doctor in MySQL:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update doctor record.',
      details: error.message
    });
  }
});

module.exports = router;
