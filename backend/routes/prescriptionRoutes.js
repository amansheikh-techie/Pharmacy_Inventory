// =====================================================================
// Phase 4D: Prescription Management API Routes
// Uses actual MySQL schema: prescription, prescriptionitem, patient, doctor, medicine
// Enforces transaction safety, foreign key validation, and data integrity
// =====================================================================

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /api/prescriptions
 * Returns prescription history ledger with patient and doctor details.
 * Supports search via ?search= and pagination via ?limit=50&offset=0
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const search = (req.query.search || '').trim().toLowerCase();

    let countQuery = 'SELECT COUNT(*) AS total FROM prescription';
    const [[{ total }]] = await pool.query(countQuery);

    let query = `
      SELECT 
        pr.prescription_id AS id,
        CONCAT('RX-2026-', LPAD(pr.prescription_id, 4, '0')) AS rxNumber,
        DATE_FORMAT(pr.prescription_date, '%Y-%m-%d') AS date,
        pr.patient_id AS patientId,
        p.patient_name AS patientName,
        p.phone AS patientPhone,
        pr.doctor_id AS doctorId,
        d.doctor_name AS doctorName,
        d.specialization AS doctorSpecialization,
        COUNT(pi.prescription_item_id) AS itemCount,
        COALESCE(SUM(pi.quantity), 0) AS totalQuantity
      FROM prescription pr
      JOIN patient p ON pr.patient_id = p.patient_id
      JOIN doctor d ON pr.doctor_id = d.doctor_id
      LEFT JOIN prescriptionitem pi ON pr.prescription_id = pi.prescription_id
    `;

    const params = [];
    if (search) {
      query += `
        WHERE LOWER(p.patient_name) LIKE ? 
           OR LOWER(d.doctor_name) LIKE ? 
           OR LOWER(d.specialization) LIKE ?
           OR CONCAT('rx-2026-', LPAD(pr.prescription_id, 4, '0')) LIKE ?
      `;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    query += `
      GROUP BY pr.prescription_id, pr.prescription_date, pr.patient_id, p.patient_name, p.phone, pr.doctor_id, d.doctor_name, d.specialization
      ORDER BY pr.prescription_id DESC
      LIMIT ? OFFSET ?;
    `;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    const formattedData = rows.map(r => ({
      id: r.id,
      rxNumber: r.rxNumber,
      date: r.date,
      patientId: r.patientId,
      patientName: r.patientName,
      patientPhone: r.patientPhone,
      doctorId: r.doctorId,
      doctorName: r.doctorName,
      doctorSpecialization: r.doctorSpecialization,
      itemCount: parseInt(r.itemCount, 10),
      totalQuantity: parseInt(r.totalQuantity, 10)
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
    console.error('Error fetching prescriptions from MySQL:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve prescription ledger',
      details: error.message
    });
  }
});

/**
 * GET /api/prescriptions/:id
 * Returns a single prescription with associated medicine items.
 * Strictly uses schema fields: prescription_item_id, medicine_id, dosage, quantity
 */
router.get('/:id', async (req, res) => {
  const prescriptionId = parseInt(req.params.id, 10);
  if (isNaN(prescriptionId) || prescriptionId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid prescription ID. Must be a positive integer.'
    });
  }

  try {
    const rxQuery = `
      SELECT 
        pr.prescription_id AS id,
        CONCAT('RX-2026-', LPAD(pr.prescription_id, 4, '0')) AS rxNumber,
        DATE_FORMAT(pr.prescription_date, '%Y-%m-%d') AS date,
        pr.patient_id AS patientId,
        p.patient_name AS patientName,
        p.phone AS patientPhone,
        pr.doctor_id AS doctorId,
        d.doctor_name AS doctorName,
        d.specialization AS doctorSpecialization
      FROM prescription pr
      JOIN patient p ON pr.patient_id = p.patient_id
      JOIN doctor d ON pr.doctor_id = d.doctor_id
      WHERE pr.prescription_id = ?;
    `;

    const [prescriptions] = await pool.query(rxQuery, [prescriptionId]);
    if (prescriptions.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Prescription #${prescriptionId} not found.`
      });
    }

    const rx = prescriptions[0];

    const itemsQuery = `
      SELECT 
        pi.prescription_item_id AS itemId,
        pi.medicine_id AS medicineId,
        m.medicine_name AS medicineName,
        m.manufacturer,
        pi.dosage,
        pi.quantity
      FROM prescriptionitem pi
      JOIN medicine m ON pi.medicine_id = m.medicine_id
      WHERE pi.prescription_id = ?
      ORDER BY pi.prescription_item_id ASC;
    `;

    const [items] = await pool.query(itemsQuery, [prescriptionId]);

    const formattedItems = items.map(item => ({
      itemId: item.itemId,
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      manufacturer: item.manufacturer,
      dosage: item.dosage,
      quantity: parseInt(item.quantity, 10)
    }));

    res.status(200).json({
      success: true,
      data: {
        id: rx.id,
        rxNumber: rx.rxNumber,
        date: rx.date,
        patientId: rx.patientId,
        patientName: rx.patientName,
        patientPhone: rx.patientPhone,
        doctorId: rx.doctorId,
        doctorName: rx.doctorName,
        doctorSpecialization: rx.doctorSpecialization,
        itemsCount: formattedItems.length,
        items: formattedItems
      }
    });
  } catch (error) {
    console.error(`Error fetching prescription #${prescriptionId}:`, error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve prescription details',
      details: error.message
    });
  }
});

/**
 * POST /api/prescriptions
 * Creates a prescription and its prescribed medicine items within a MySQL transaction.
 *
 * Payload:
 * {
 *   "patientId": 1,
 *   "doctorId": 2,
 *   "prescriptionDate": "2026-10-24", // optional, defaults to CURDATE()
 *   "items": [
 *     { "medicineId": 1, "dosage": "500 mg twice daily", "quantity": 10 },
 *     { "medicineId": 2, "dosage": "10 mg once daily", "quantity": 5 }
 *   ]
 * }
 *
 * Safety & Invariants:
 * 1. Validates existence of referenced patient and doctor in MySQL.
 * 2. Validates existence of all referenced medicines in MySQL.
 * 3. Uses connection.beginTransaction() / commit() / rollback().
 * 4. Uses parameterized queries.
 * 5. DOES NOT deduct inventory or create a sale (inventory deduction occurs on dispensing/sale).
 */
router.post('/', async (req, res) => {
  const { patientId, doctorId, prescriptionDate, items } = req.body;

  // 1. Validate patientId
  const parsedPatientId = parseInt(patientId, 10);
  if (isNaN(parsedPatientId) || parsedPatientId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Valid patientId is required (must be a positive integer).'
    });
  }

  // 2. Validate doctorId
  const parsedDoctorId = parseInt(doctorId, 10);
  if (isNaN(parsedDoctorId) || parsedDoctorId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Valid doctorId is required (must be a positive integer).'
    });
  }

  // 3. Confirm referenced patient exists
  const [patientCheck] = await pool.query(
    'SELECT patient_id, patient_name FROM patient WHERE patient_id = ?',
    [parsedPatientId]
  );
  if (patientCheck.length === 0) {
    return res.status(400).json({
      success: false,
      error: `Referenced patient ID ${parsedPatientId} does not exist in patient registry.`
    });
  }

  // 4. Confirm referenced doctor exists
  const [doctorCheck] = await pool.query(
    'SELECT doctor_id, doctor_name FROM doctor WHERE doctor_id = ?',
    [parsedDoctorId]
  );
  if (doctorCheck.length === 0) {
    return res.status(400).json({
      success: false,
      error: `Referenced doctor ID ${parsedDoctorId} does not exist in doctor registry.`
    });
  }

  // 5. Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Prescription must contain at least one prescribed medicine item.'
    });
  }

  // Validate item format
  for (let idx = 0; idx < items.length; idx++) {
    const it = items[idx];
    const medId = parseInt(it.medicineId, 10);
    const qty = parseInt(it.quantity, 10);
    const dosage = (it.dosage || '').trim();

    if (isNaN(medId) || medId <= 0) {
      return res.status(400).json({
        success: false,
        error: `Item at index ${idx} has an invalid medicine ID (${it.medicineId}). Must be a positive integer.`
      });
    }

    if (!dosage) {
      return res.status(400).json({
        success: false,
        error: `Item at index ${idx} requires clinical dosage instructions (e.g. '500 mg twice daily').`
      });
    }

    if (dosage.length > 100) {
      return res.status(400).json({
        success: false,
        error: `Item at index ${idx} dosage exceeds maximum length of 100 characters.`
      });
    }

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        error: `Item at index ${idx} has an invalid quantity (${it.quantity}). Quantity must be a positive integer (> 0).`
      });
    }
  }

  // 6. Confirm all referenced medicines exist in MySQL
  const medicineIds = items.map(it => parseInt(it.medicineId, 10));
  const [medRows] = await pool.query(
    'SELECT medicine_id, medicine_name FROM medicine WHERE medicine_id IN (?)',
    [medicineIds]
  );
  const foundMedIds = new Set(medRows.map(m => m.medicine_id));

  for (const it of items) {
    const medId = parseInt(it.medicineId, 10);
    if (!foundMedIds.has(medId)) {
      return res.status(400).json({
        success: false,
        error: `Prescribed medicine with ID ${medId} does not exist in medicine catalog.`
      });
    }
  }

  // 7. Validate prescriptionDate if provided
  let formattedDate = null;
  if (prescriptionDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(prescriptionDate) || isNaN(Date.parse(prescriptionDate))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid prescriptionDate format. Expected YYYY-MM-DD.'
      });
    }
    formattedDate = prescriptionDate;
  }

  // 8. Execute transactional prescription creation
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert prescription master record
    const insertRxSql = formattedDate
      ? 'INSERT INTO prescription (patient_id, doctor_id, prescription_date) VALUES (?, ?, ?)'
      : 'INSERT INTO prescription (patient_id, doctor_id, prescription_date) VALUES (?, ?, CURDATE())';
    const insertRxParams = formattedDate
      ? [parsedPatientId, parsedDoctorId, formattedDate]
      : [parsedPatientId, parsedDoctorId];

    const [rxResult] = await connection.query(insertRxSql, insertRxParams);
    const newPrescriptionId = rxResult.insertId;

    // Insert prescription items
    const insertedItems = [];
    for (const it of items) {
      const medId = parseInt(it.medicineId, 10);
      const qty = parseInt(it.quantity, 10);
      const dosage = it.dosage.trim();

      const [itemResult] = await connection.query(
        'INSERT INTO prescriptionitem (prescription_id, medicine_id, dosage, quantity) VALUES (?, ?, ?, ?)',
        [newPrescriptionId, medId, dosage, qty]
      );

      const medObj = medRows.find(m => m.medicine_id === medId);
      insertedItems.push({
        itemId: itemResult.insertId,
        medicineId: medId,
        medicineName: medObj ? medObj.medicine_name : 'Unknown Medicine',
        dosage,
        quantity: qty
      });
    }

    // Retrieve verified date
    const [[savedRx]] = await connection.query(
      'SELECT DATE_FORMAT(prescription_date, "%Y-%m-%d") AS rxDate FROM prescription WHERE prescription_id = ?',
      [newPrescriptionId]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Prescription recorded successfully in database.',
      data: {
        prescriptionId: newPrescriptionId,
        rxNumber: `RX-2026-${String(newPrescriptionId).padStart(4, '0')}`,
        date: savedRx.rxDate,
        patientId: parsedPatientId,
        patientName: patientCheck[0].patient_name,
        doctorId: parsedDoctorId,
        doctorName: doctorCheck[0].doctor_name,
        itemsCount: insertedItems.length,
        items: insertedItems
      }
    });

  } catch (txError) {
    try {
      await connection.rollback();
    } catch (rbErr) {
      console.error('Rollback error:', rbErr.message);
    }

    console.error('Prescription transaction failed:', txError.message);
    return res.status(500).json({
      success: false,
      error: 'Prescription creation failed. All changes have been safely rolled back.',
      details: txError.message
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
