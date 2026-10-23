// =====================================================================
// Phase 4D: Comprehensive Automated Test Suite for Prescription APIs
// Tests GET /api/patients, GET /api/doctors,
// GET /api/prescriptions, GET /api/prescriptions/:id, and POST /api/prescriptions
// Verifies Transaction Safety, Foreign Key Checks, Rollback on Failure,
// and Confirms Zero Inventory Deduction and Zero Sale Creation.
// =====================================================================

const http = require('http');
const express = require('express');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const { pool } = require('./db');

const app = express();
app.use(express.json());
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);

let server;
let baseUrl;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (_) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          body: parsed
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runPrescriptionTests() {
  console.log('=============================================================');
  console.log('🧪 Starting Phase 4D Prescription Management API Test Suite');
  console.log('=============================================================');

  // Start test server on random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`✓ Test server running on ${baseUrl}`);
      resolve();
    });
  });

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      testsFailed++;
    }
  }

  // Tracking IDs for cleanup
  let testPatientId = null;
  let testDoctorId = null;
  let testMedicineAId = null;
  let testMedicineBId = null;
  let testBatchAId = null;
  const createdRxIds = [];

  try {
    // -----------------------------------------------------------------
    // SETUP: Provision Dedicated Test Patient, Doctor, and Medicines
    // -----------------------------------------------------------------
    console.log('\n--- Setup: Provisioning Dedicated Test Records ---');
    const [patRes] = await pool.query(
      'INSERT INTO patient (patient_name, phone) VALUES (?, ?)',
      [`Test Patient ${Date.now()}`, '9998887776']
    );
    testPatientId = patRes.insertId;

    const [docRes] = await pool.query(
      'INSERT INTO doctor (doctor_name, specialization) VALUES (?, ?)',
      [`Dr. Test Physician ${Date.now()}`, 'Clinical Pharmacology']
    );
    testDoctorId = docRes.insertId;

    const [medARes] = await pool.query(
      'INSERT INTO medicine (medicine_name, category_id, manufacturer) VALUES (?, 1, "Rx Labs Alpha")',
      [`Rx Test Med A ${Date.now()}`]
    );
    testMedicineAId = medARes.insertId;

    const [medBRes] = await pool.query(
      'INSERT INTO medicine (medicine_name, category_id, manufacturer) VALUES (?, 1, "Rx Labs Beta")',
      [`Rx Test Med B ${Date.now()}`]
    );
    testMedicineBId = medBRes.insertId;

    // Create an inventory batch for Medicine A with 100 units to test inventory non-deduction
    const [batchARes] = await pool.query(
      'INSERT INTO medicinebatch (medicine_id, batch_number, quantity, unit_price, expiry_date) VALUES (?, ?, 100, 15.00, "2028-12-31")',
      [testMedicineAId, `RX-BT-${Date.now().toString().slice(-6)}`]
    );
    testBatchAId = batchARes.insertId;

    console.log(`✓ Provisioned test patient ID: ${testPatientId}`);
    console.log(`✓ Provisioned test doctor ID: ${testDoctorId}`);
    console.log(`✓ Provisioned test medicine A (ID: ${testMedicineAId}) with batch (100 units)`);
    console.log(`✓ Provisioned test medicine B (ID: ${testMedicineBId})`);

    // -----------------------------------------------------------------
    // TEST 1: GET /api/patients - View Patient Registry
    // -----------------------------------------------------------------
    console.log('\n--- 1. Testing GET /api/patients: Patient Registry ---');
    const getPatRes = await request('GET', '/api/patients');
    assert(getPatRes.status === 200, 'GET /api/patients returns 200 OK');
    assert(getPatRes.body.success === true, 'Response body has success: true');
    assert(Array.isArray(getPatRes.body.data), 'Patients data is an array');
    assert(getPatRes.body.data.length >= 4, `Returned ${getPatRes.body.data.length} patients`);
    const foundPat = getPatRes.body.data.find(p => p.id === testPatientId);
    assert(Boolean(foundPat), 'Created test patient is present in registry');

    // -----------------------------------------------------------------
    // TEST 2: GET /api/doctors - View Doctor Registry
    // -----------------------------------------------------------------
    console.log('\n--- 2. Testing GET /api/doctors: Doctor Registry ---');
    const getDocRes = await request('GET', '/api/doctors');
    assert(getDocRes.status === 200, 'GET /api/doctors returns 200 OK');
    assert(getDocRes.body.success === true, 'Response body has success: true');
    assert(Array.isArray(getDocRes.body.data), 'Doctors data is an array');
    assert(getDocRes.body.data.length >= 4, `Returned ${getDocRes.body.data.length} doctors`);
    const foundDoc = getDocRes.body.data.find(d => d.id === testDoctorId);
    assert(Boolean(foundDoc), 'Created test doctor is present in registry');

    // -----------------------------------------------------------------
    // TEST 3: GET /api/prescriptions - View Prescription Ledger
    // -----------------------------------------------------------------
    console.log('\n--- 3. Testing GET /api/prescriptions: Prescription Ledger ---');
    const getRxRes = await request('GET', '/api/prescriptions');
    assert(getRxRes.status === 200, 'GET /api/prescriptions returns 200 OK');
    assert(getRxRes.body.success === true, 'Response body has success: true');
    assert(Array.isArray(getRxRes.body.data), 'Prescriptions data is an array');
    assert(getRxRes.body.data.length >= 3, `Returned ${getRxRes.body.data.length} prescriptions`);
    const sampleRx = getRxRes.body.data[0];
    assert(Boolean(sampleRx.rxNumber), 'Prescription includes formatted rxNumber');
    assert(sampleRx.patientName !== undefined, 'Includes patient name');
    assert(sampleRx.doctorName !== undefined, 'Includes doctor name');

    // -----------------------------------------------------------------
    // TEST 4: GET /api/prescriptions/:id - View Prescription Details
    // -----------------------------------------------------------------
    console.log('\n--- 4. Testing GET /api/prescriptions/1: Single Prescription ---');
    const rx1Res = await request('GET', '/api/prescriptions/1');
    assert(rx1Res.status === 200, 'GET /api/prescriptions/1 returns 200 OK');
    assert(rx1Res.body.success === true, 'Response body has success: true');
    assert(rx1Res.body.data.id === 1, 'Prescription ID matches requested ID');
    assert(Array.isArray(rx1Res.body.data.items), 'Prescription includes items array');
    assert(rx1Res.body.data.items.length === 2, 'Prescription 1 has 2 items');
    assert(rx1Res.body.data.items[0].medicineName === 'Paracetamol', 'Includes joined medicine name');
    assert(rx1Res.body.data.items[0].dosage !== undefined, 'Includes clinical dosage');
    assert(rx1Res.body.data.items[0].quantity > 0, 'Includes prescribed quantity');

    // -----------------------------------------------------------------
    // TEST 5: GET /api/prescriptions/:id - 404 & 400 Validation
    // -----------------------------------------------------------------
    console.log('\n--- 5. Testing GET /api/prescriptions/:id 404 & 400 Validation ---');
    const notFoundRxRes = await request('GET', '/api/prescriptions/999999');
    assert(notFoundRxRes.status === 404, 'Returns 404 for non-existent prescription ID');
    assert(notFoundRxRes.body.success === false, 'Returns success: false');

    const badIdRxRes = await request('GET', '/api/prescriptions/invalid-id');
    assert(badIdRxRes.status === 400, 'Returns 400 for non-numeric prescription ID');

    // -----------------------------------------------------------------
    // TEST 6: POST /api/prescriptions - Validation: Non-existent Patient ID
    // -----------------------------------------------------------------
    console.log('\n--- 6. Testing POST /api/prescriptions Validation: Invalid Patient ---');
    const badPatRes = await request('POST', '/api/prescriptions', {
      patientId: 999999,
      doctorId: testDoctorId,
      items: [{ medicineId: testMedicineAId, dosage: '500 mg twice daily', quantity: 10 }]
    });
    assert(badPatRes.status === 400, 'Rejects non-existent patient ID with 400 Bad Request');
    assert(badPatRes.body.error.includes('does not exist in patient registry'), 'Error specifies patient does not exist');

    // -----------------------------------------------------------------
    // TEST 7: POST /api/prescriptions - Validation: Non-existent Doctor ID
    // -----------------------------------------------------------------
    console.log('\n--- 7. Testing POST /api/prescriptions Validation: Invalid Doctor ---');
    const badDocRes = await request('POST', '/api/prescriptions', {
      patientId: testPatientId,
      doctorId: 999999,
      items: [{ medicineId: testMedicineAId, dosage: '500 mg twice daily', quantity: 10 }]
    });
    assert(badDocRes.status === 400, 'Rejects non-existent doctor ID with 400 Bad Request');
    assert(badDocRes.body.error.includes('does not exist in doctor registry'), 'Error specifies doctor does not exist');

    // -----------------------------------------------------------------
    // TEST 8: POST /api/prescriptions - Validation: Non-existent Medicine ID
    // -----------------------------------------------------------------
    console.log('\n--- 8. Testing POST /api/prescriptions Validation: Invalid Medicine ---');
    const badMedRes = await request('POST', '/api/prescriptions', {
      patientId: testPatientId,
      doctorId: testDoctorId,
      items: [{ medicineId: 999999, dosage: '500 mg twice daily', quantity: 10 }]
    });
    assert(badMedRes.status === 400, 'Rejects non-existent medicine ID with 400 Bad Request');
    assert(badMedRes.body.error.includes('does not exist in medicine catalog'), 'Error specifies medicine does not exist');

    // -----------------------------------------------------------------
    // TEST 9: POST /api/prescriptions - Validation: Empty Items & Invalid Quantities
    // -----------------------------------------------------------------
    console.log('\n--- 9. Testing POST /api/prescriptions Validation: Items & Quantities ---');
    const emptyItemsRes = await request('POST', '/api/prescriptions', {
      patientId: testPatientId,
      doctorId: testDoctorId,
      items: []
    });
    assert(emptyItemsRes.status === 400, 'Rejects empty items array with 400 Bad Request');

    const zeroQtyRes = await request('POST', '/api/prescriptions', {
      patientId: testPatientId,
      doctorId: testDoctorId,
      items: [{ medicineId: testMedicineAId, dosage: '500 mg twice daily', quantity: 0 }]
    });
    assert(zeroQtyRes.status === 400, 'Rejects quantity <= 0 with 400 Bad Request');

    const emptyDosageRes = await request('POST', '/api/prescriptions', {
      patientId: testPatientId,
      doctorId: testDoctorId,
      items: [{ medicineId: testMedicineAId, dosage: '   ', quantity: 5 }]
    });
    assert(emptyDosageRes.status === 400, 'Rejects missing dosage instruction with 400 Bad Request');

    // -----------------------------------------------------------------
    // TEST 10: POST /api/prescriptions - Create Valid Multi-Item Prescription
    // -----------------------------------------------------------------
    console.log('\n--- 10. Testing Valid Multi-Item Prescription Creation ---');
    // Check initial sales count & initial batch stock
    const [[{ initialSalesCount }]] = await pool.query('SELECT COUNT(*) AS initialSalesCount FROM sale');
    const [[initialBatch]] = await pool.query('SELECT quantity FROM medicinebatch WHERE batch_id = ?', [testBatchAId]);
    assert(initialBatch.quantity === 100, 'Initial inventory batch A has 100 units');

    const createRxRes = await request('POST', '/api/prescriptions', {
      patientId: testPatientId,
      doctorId: testDoctorId,
      prescriptionDate: '2026-10-24',
      items: [
        { medicineId: testMedicineAId, dosage: '500 mg twice daily with meals', quantity: 14 },
        { medicineId: testMedicineBId, dosage: '10 mg once daily at night', quantity: 7 }
      ]
    });

    assert(createRxRes.status === 201, 'Creates prescription with 201 Created');
    assert(createRxRes.body.success === true, 'Response body has success: true');
    const newRxId = createRxRes.body.data.prescriptionId;
    createdRxIds.push(newRxId);
    assert(createRxRes.body.data.itemsCount === 2, 'Response indicates 2 prescribed items');
    assert(createRxRes.body.data.rxNumber === `RX-2026-${String(newRxId).padStart(4, '0')}`, 'Generated rxNumber matches format');

    // Verify Prescription Master Record in MySQL
    const [[savedRxRow]] = await pool.query('SELECT * FROM prescription WHERE prescription_id = ?', [newRxId]);
    assert(savedRxRow.patient_id === testPatientId, 'Saved prescription patient_id matches');
    assert(savedRxRow.doctor_id === testDoctorId, 'Saved prescription doctor_id matches');

    // Verify Prescription Items in MySQL
    const [savedItems] = await pool.query('SELECT * FROM prescriptionitem WHERE prescription_id = ? ORDER BY prescription_item_id ASC', [newRxId]);
    assert(savedItems.length === 2, 'Prescription has 2 items in prescriptionitem table');
    assert(savedItems[0].dosage === '500 mg twice daily with meals', 'Saved dosage matches for item 1');
    assert(savedItems[0].quantity === 14, 'Saved quantity matches for item 1');
    assert(savedItems[1].dosage === '10 mg once daily at night', 'Saved dosage matches for item 2');
    assert(savedItems[1].quantity === 7, 'Saved quantity matches for item 2');

    // -----------------------------------------------------------------
    // TEST 11: Invariant Check: Zero Inventory Deduction & Zero Sale Creation
    // -----------------------------------------------------------------
    console.log('\n--- 11. Verifying Zero Inventory Deduction & Zero Sale Creation ---');
    const [[batchAfterRx]] = await pool.query('SELECT quantity FROM medicinebatch WHERE batch_id = ?', [testBatchAId]);
    assert(batchAfterRx.quantity === 100, 'Batch stock remains exactly 100 (NO accidental inventory deduction)');

    const [[{ salesCountAfterRx }]] = await pool.query('SELECT COUNT(*) AS salesCountAfterRx FROM sale');
    assert(salesCountAfterRx === initialSalesCount, 'Total sales count unchanged in MySQL (NO accidental sale created)');

    // -----------------------------------------------------------------
    // TEST 12: GET /api/prescriptions/:id - Retrieve Newly Created Prescription
    // -----------------------------------------------------------------
    console.log('\n--- 12. Testing GET /api/prescriptions/:id for New Prescription ---');
    const getNewRxRes = await request('GET', `/api/prescriptions/${newRxId}`);
    assert(getNewRxRes.status === 200, 'GET /api/prescriptions/:id returns 200 for new prescription');
    assert(getNewRxRes.body.data.patientName.includes('Test Patient'), 'Returned joined patient name');
    assert(getNewRxRes.body.data.doctorName.includes('Dr. Test Physician'), 'Returned joined doctor name');
    assert(getNewRxRes.body.data.items.length === 2, 'Returned 2 line items with joined medicine names');

    // -----------------------------------------------------------------
    // TEST 13: Transaction Rollback on Partial Item Failure
    // -----------------------------------------------------------------
    console.log('\n--- 13. Testing Transaction Rollback on Multi-Item Failure ---');
    // Item 1: Valid medicine
    // Item 2: Invalid medicine ID (999999)
    const [[{ rxCountBeforeFailedTx }]] = await pool.query('SELECT COUNT(*) AS rxCountBeforeFailedTx FROM prescription');
    const [[{ itemsCountBeforeFailedTx }]] = await pool.query('SELECT COUNT(*) AS itemsCountBeforeFailedTx FROM prescriptionitem');

    const failedTxRes = await request('POST', '/api/prescriptions', {
      patientId: testPatientId,
      doctorId: testDoctorId,
      items: [
        { medicineId: testMedicineAId, dosage: '250 mg daily', quantity: 5 },
        { medicineId: 999999, dosage: '50 mg daily', quantity: 10 }
      ]
    });
    assert(failedTxRes.status === 400, 'Rejects invalid transaction with 400 Bad Request');

    const [[{ rxCountAfterFailedTx }]] = await pool.query('SELECT COUNT(*) AS rxCountAfterFailedTx FROM prescription');
    const [[{ itemsCountAfterFailedTx }]] = await pool.query('SELECT COUNT(*) AS itemsCountAfterFailedTx FROM prescriptionitem');

    assert(rxCountAfterFailedTx === rxCountBeforeFailedTx, 'Prescription table count unchanged (atomic rollback confirmed)');
    assert(itemsCountAfterFailedTx === itemsCountBeforeFailedTx, 'PrescriptionItem table count unchanged (no orphan items created)');

    // -----------------------------------------------------------------
    // TEST 14: Pre-existing Data Integrity Verification
    // -----------------------------------------------------------------
    console.log('\n--- 14. Verifying Pre-existing Data Intact ---');
    const [origRx] = await pool.query('SELECT prescription_id FROM prescription WHERE prescription_id IN (1, 2, 3)');
    assert(origRx.length === 3, 'Pre-existing business prescriptions (1, 2, 3) are completely intact');

  } catch (err) {
    console.error('Unexpected test error:', err);
    testsFailed++;
  } finally {
    // -----------------------------------------------------------------
    // CLEANUP: Clean up only test records created during test run
    // -----------------------------------------------------------------
    console.log('\n--- Cleaning up test records from database ---');
    try {
      for (const rxId of createdRxIds) {
        await pool.query('DELETE FROM prescriptionitem WHERE prescription_id = ?', [rxId]);
        await pool.query('DELETE FROM prescription WHERE prescription_id = ?', [rxId]);
        console.log(`✓ Cleaned up test prescription ID ${rxId}`);
      }
      if (testBatchAId) await pool.query('DELETE FROM medicinebatch WHERE batch_id = ?', [testBatchAId]);
      if (testMedicineBId) await pool.query('DELETE FROM medicine WHERE medicine_id = ?', [testMedicineBId]);
      if (testMedicineAId) await pool.query('DELETE FROM medicine WHERE medicine_id = ?', [testMedicineAId]);
      if (testDoctorId) await pool.query('DELETE FROM doctor WHERE doctor_id = ?', [testDoctorId]);
      if (testPatientId) await pool.query('DELETE FROM patient WHERE patient_id = ?', [testPatientId]);
      console.log('✓ Cleaned up test batch, test medicines, test doctor, and test patient');
    } catch (cleanupErr) {
      console.warn('Cleanup warning:', cleanupErr.message);
    }

    if (server) server.close();
    await pool.end();

    console.log('\n=============================================================');
    console.log(`🏁 Prescription Test Summary: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('=============================================================');

    if (testsFailed > 0) {
      process.exit(1);
    }
  }
}

runPrescriptionTests();
