// =====================================================================
// Patient API Routes (Phase 4E)
// Uses actual MySQL schema: patient (patient_id, patient_name, phone)
// Avoids exposing unnecessary personal or sensitive information
// =====================================================================

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/patients
 * Returns the patient fields needed for prescription and clinical records.
 * Supports search via ?search=
 * Fields: id, name, phone
 */
router.get('/', async (req, res) => {
  try {
    const search = (req.query.search || '').trim().toLowerCase();

    let query = `
      SELECT 
        patient_id AS id,
        patient_name AS name,
        COALESCE(phone, '') AS phone
      FROM patient
    `;
    const params = [];

    if (search) {
      query += ` WHERE LOWER(patient_name) LIKE ? OR phone LIKE ?`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    query += ` ORDER BY patient_name ASC;`;

    const [rows] = await pool.query(query, params);

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

/**
 * GET /api/patients/:id
 * Returns a single patient record by ID.
 */
router.get('/:id', async (req, res) => {
  const patientId = parseInt(req.params.id, 10);
  if (isNaN(patientId) || patientId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid patient ID. Must be a positive integer.'
    });
  }

  try {
    const query = `
      SELECT 
        patient_id AS id,
        patient_name AS name,
        COALESCE(phone, '') AS phone
      FROM patient
      WHERE patient_id = ?;
    `;
    const [rows] = await pool.query(query, [patientId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Patient #${patientId} not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching patient by ID:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve patient details',
      details: error.message
    });
  }
});

/**
 * POST /api/patients
 * Adds a new patient using supported schema fields: patient_name, phone.
 */
router.post('/', async (req, res) => {
  try {
    const rawName = req.body.name || req.body.patient_name;
    const name = typeof rawName === 'string' ? rawName.trim() : '';
    const rawPhone = req.body.phone;
    const phone = typeof rawPhone === 'string' ? rawPhone.trim() : (rawPhone ? String(rawPhone).trim() : null);

    // Validation: patient_name is NOT NULL in schema
    if (!name || name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Patient name is required (between 2 and 100 characters).'
      });
    }

    if (phone && phone.length > 15) {
      return res.status(400).json({
        success: false,
        error: 'Phone number must not exceed 15 characters.'
      });
    }

    const insertQuery = `
      INSERT INTO patient (patient_name, phone)
      VALUES (?, ?);
    `;
    const [result] = await pool.query(insertQuery, [name, phone || null]);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully in MySQL.',
      data: {
        id: result.insertId,
        name: name,
        phone: phone || ''
      }
    });
  } catch (error) {
    console.error('Error creating patient in MySQL:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to register patient in database.',
      details: error.message
    });
  }
});

/**
 * PUT /api/patients/:id
 * Updates an existing patient record using supported schema fields.
 */
router.put('/:id', async (req, res) => {
  const patientId = parseInt(req.params.id, 10);
  if (isNaN(patientId) || patientId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid patient ID. Must be a positive integer.'
    });
  }

  try {
    // Confirm patient exists
    const [existing] = await pool.query('SELECT patient_id FROM patient WHERE patient_id = ?;', [patientId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Patient #${patientId} not found.`
      });
    }

    const rawName = req.body.name || req.body.patient_name;
    const name = typeof rawName === 'string' ? rawName.trim() : '';
    const rawPhone = req.body.phone;
    const phone = typeof rawPhone === 'string' ? rawPhone.trim() : (rawPhone ? String(rawPhone).trim() : null);

    if (!name || name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Patient name is required (between 2 and 100 characters).'
      });
    }

    if (phone && phone.length > 15) {
      return res.status(400).json({
        success: false,
        error: 'Phone number must not exceed 15 characters.'
      });
    }

    const updateQuery = `
      UPDATE patient 
      SET patient_name = ?, phone = ?
      WHERE patient_id = ?;
    `;
    await pool.query(updateQuery, [name, phone || null, patientId]);

    res.status(200).json({
      success: true,
      message: 'Patient record updated successfully.',
      data: {
        id: patientId,
        name: name,
        phone: phone || ''
      }
    });
  } catch (error) {
    console.error('Error updating patient in MySQL:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update patient record.',
      details: error.message
    });
  }
});

module.exports = router;
