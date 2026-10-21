// =====================================================================
// Prescription API Routes
// =====================================================================

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET /api/prescriptions - Fetch doctor prescriptions with items
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        pr.PrescriptionID AS id,
        CONCAT('RX-2026-', LPAD(pr.PrescriptionID, 4, '0')) AS rxNumber,
        pr.PrescriptionDate AS date,
        pr.Notes AS diagnosis,
        pr.Status AS status,
        p.PatientName AS patientName,
        p.Age AS patientAge,
        p.Gender AS patientGender,
        d.DoctorName AS doctorName,
        d.Specialization AS doctorSpecialization
      FROM Prescription pr
      JOIN Patient p ON pr.PatientID = p.PatientID
      JOIN Doctor d ON pr.DoctorID = d.DoctorID
      ORDER BY pr.PrescriptionDate DESC;
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve prescriptions', details: error.message });
  }
});

// PUT /api/prescriptions/:id/dispense - Mark prescription as fulfilled
router.put('/:id/dispense', async (req, res) => {
  const prescriptionId = req.params.id;
  try {
    await pool.query('UPDATE Prescription SET Status = "Fulfilled" WHERE PrescriptionID = ?', [prescriptionId]);
    res.json({ message: 'Prescription marked as fulfilled', prescriptionId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update prescription status', details: error.message });
  }
});

module.exports = router;
