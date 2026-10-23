// =====================================================================
// Phase 4E Automated Test Suite: Patient & Doctor Management Module
// Validates:
// - GET, POST, PUT for /api/patients
// - GET, POST, PUT for /api/doctors
// - Parameterized search filtering
// - Input validation (missing names, lengths, non-numeric IDs)
// - Database integrity in MySQL `pharmacy_db`
// - Integration with Prescription creation
// =====================================================================

const http = require('http');
const express = require('express');
const { pool } = require('./db');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');

let testServer;
let port;
let baseUrl;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function request(method, path, body = null) {
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
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=============================================================');
  console.log('🧪 Starting Phase 4E Patient & Doctor Management Test Suite');
  console.log('=============================================================');

  const app = express();
  app.use(express.json());
  app.use('/api/patients', patientRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);

  testServer = http.createServer(app);
  await new Promise(resolve => {
    testServer.listen(0, () => {
      port = testServer.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`✓ Test server running on ${baseUrl}\n`);
      resolve();
    });
  });

  let createdPatientId = null;
  let createdDoctorId = null;
  let createdPrescriptionId = null;

  try {
    // -------------------------------------------------------------
    // 1. GET /api/patients (List & Search)
    // -------------------------------------------------------------
    console.log('--- 1. Testing GET /api/patients: Patient Registry ---');
    const getPatientsRes = await request('GET', '/api/patients');
    assert(getPatientsRes.status === 200, 'GET /api/patients returns 200 OK');
    assert(getPatientsRes.body.success === true, 'Response body has success: true');
    assert(Array.isArray(getPatientsRes.body.data), 'Patients data is an array');
    assert(getPatientsRes.body.count >= 3, `Returned ${getPatientsRes.body.count} patients (>= 3 pre-existing)`);

    // Test Search filter
    const searchPatientRes = await request('GET', '/api/patients?search=Rahul');
    assert(searchPatientRes.status === 200, 'GET /api/patients?search=Rahul returns 200 OK');
    assert(searchPatientRes.body.data.some(p => p.name.includes('Rahul')), 'Search query finds "Rahul Sharma"');

    // -------------------------------------------------------------
    // 2. GET /api/patients/:id
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing GET /api/patients/:id ---');
    const singlePatientRes = await request('GET', '/api/patients/1');
    assert(singlePatientRes.status === 200, 'GET /api/patients/1 returns 200 OK');
    assert(singlePatientRes.body.data.id === 1, 'Patient ID matches 1');
    assert(singlePatientRes.body.data.name === 'Rahul Sharma', 'Patient name matches "Rahul Sharma"');

    const notFoundPatientRes = await request('GET', '/api/patients/999999');
    assert(notFoundPatientRes.status === 404, 'Returns 404 for non-existent patient ID');
    assert(notFoundPatientRes.body.success === false, '404 response has success: false');

    const invalidIdPatientRes = await request('GET', '/api/patients/invalid-id');
    assert(invalidIdPatientRes.status === 400, 'Returns 400 for non-numeric patient ID');

    // -------------------------------------------------------------
    // 3. POST /api/patients: Validation & Creation
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing POST /api/patients: Validation & Registration ---');
    
    // Validation: Missing / empty name
    const missingNamePatientRes = await request('POST', '/api/patients', { name: '', phone: '9999999999' });
    assert(missingNamePatientRes.status === 400, 'Rejects empty patient name with 400 Bad Request');
    assert(missingNamePatientRes.body.success === false, 'Response has success: false');

    // Validation: Phone too long (> 15 chars)
    const longPhonePatientRes = await request('POST', '/api/patients', { name: 'Test Patient', phone: '1234567890123456789' });
    assert(longPhonePatientRes.status === 400, 'Rejects phone > 15 chars with 400 Bad Request');

    // Valid Patient Creation
    const validPatientRes = await request('POST', '/api/patients', {
      name: 'Synthetic Test Patient',
      phone: '9888877777'
    });
    assert(validPatientRes.status === 201, 'Creates patient with 201 Created');
    assert(validPatientRes.body.success === true, 'Response has success: true');
    assert(validPatientRes.body.data.id > 0, 'Returned new patient ID');
    assert(validPatientRes.body.data.name === 'Synthetic Test Patient', 'Returned patient name matches');
    assert(validPatientRes.body.data.phone === '9888877777', 'Returned phone matches');
    createdPatientId = validPatientRes.body.data.id;

    // Verify row directly in MySQL
    const [dbPatientRows] = await pool.query('SELECT * FROM patient WHERE patient_id = ?;', [createdPatientId]);
    assert(dbPatientRows.length === 1, 'Patient row confirmed present in MySQL database');
    assert(dbPatientRows[0].patient_name === 'Synthetic Test Patient', 'MySQL patient_name matches');
    assert(dbPatientRows[0].phone === '9888877777', 'MySQL phone matches');

    // -------------------------------------------------------------
    // 4. PUT /api/patients/:id: Validation & Edit
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing PUT /api/patients/:id: Editing Patient ---');
    
    // Validation: 404 on non-existent patient
    const editNotFoundRes = await request('PUT', '/api/patients/999999', { name: 'Ghost', phone: '12345' });
    assert(editNotFoundRes.status === 404, 'PUT returns 404 for non-existent patient');

    // Validation: Rejects empty name
    const editEmptyNameRes = await request('PUT', `/api/patients/${createdPatientId}`, { name: '', phone: '99999' });
    assert(editEmptyNameRes.status === 400, 'PUT rejects empty name with 400 Bad Request');

    // Valid update
    const validEditPatientRes = await request('PUT', `/api/patients/${createdPatientId}`, {
      name: 'Updated Test Patient',
      phone: '9111122222'
    });
    assert(validEditPatientRes.status === 200, 'PUT updates patient with 200 OK');
    assert(validEditPatientRes.body.success === true, 'Response has success: true');
    assert(validEditPatientRes.body.data.name === 'Updated Test Patient', 'Response reflects updated name');
    assert(validEditPatientRes.body.data.phone === '9111122222', 'Response reflects updated phone');

    // Verify MySQL update
    const [dbUpdatedPatient] = await pool.query('SELECT * FROM patient WHERE patient_id = ?;', [createdPatientId]);
    assert(dbUpdatedPatient[0].patient_name === 'Updated Test Patient', 'MySQL verified updated patient_name');
    assert(dbUpdatedPatient[0].phone === '9111122222', 'MySQL verified updated phone');

    // -------------------------------------------------------------
    // 5. GET /api/doctors (List & Search)
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing GET /api/doctors: Doctor Registry ---');
    const getDoctorsRes = await request('GET', '/api/doctors');
    assert(getDoctorsRes.status === 200, 'GET /api/doctors returns 200 OK');
    assert(getDoctorsRes.body.success === true, 'Response body has success: true');
    assert(Array.isArray(getDoctorsRes.body.data), 'Doctors data is an array');
    assert(getDoctorsRes.body.count >= 3, `Returned ${getDoctorsRes.body.count} doctors (>= 3 pre-existing)`);

    // Test Search filter
    const searchDoctorRes = await request('GET', '/api/doctors?search=Dermatologist');
    assert(searchDoctorRes.status === 200, 'GET /api/doctors?search=Dermatologist returns 200 OK');
    assert(searchDoctorRes.body.data.some(d => d.specialization.includes('Dermatologist')), 'Search query finds "Dr. Meera Rao"');

    // -------------------------------------------------------------
    // 6. GET /api/doctors/:id
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing GET /api/doctors/:id ---');
    const singleDoctorRes = await request('GET', '/api/doctors/1');
    assert(singleDoctorRes.status === 200, 'GET /api/doctors/1 returns 200 OK');
    assert(singleDoctorRes.body.data.id === 1, 'Doctor ID matches 1');
    assert(singleDoctorRes.body.data.name === 'Dr. Anil Kumar', 'Doctor name matches "Dr. Anil Kumar"');

    const notFoundDoctorRes = await request('GET', '/api/doctors/999999');
    assert(notFoundDoctorRes.status === 404, 'Returns 404 for non-existent doctor ID');

    // -------------------------------------------------------------
    // 7. POST /api/doctors: Validation & Creation
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing POST /api/doctors: Validation & Registration ---');
    
    // Validation: Missing / empty name
    const missingNameDoctorRes = await request('POST', '/api/doctors', { name: '', specialization: 'Cardiologist' });
    assert(missingNameDoctorRes.status === 400, 'Rejects empty doctor name with 400 Bad Request');

    // Valid Doctor Creation
    const validDoctorRes = await request('POST', '/api/doctors', {
      name: 'Dr. Synthetic Test',
      specialization: 'Neurologist'
    });
    assert(validDoctorRes.status === 201, 'Creates doctor with 201 Created');
    assert(validDoctorRes.body.success === true, 'Response has success: true');
    assert(validDoctorRes.body.data.id > 0, 'Returned new doctor ID');
    assert(validDoctorRes.body.data.name === 'Dr. Synthetic Test', 'Returned doctor name matches');
    assert(validDoctorRes.body.data.specialization === 'Neurologist', 'Returned specialization matches');
    createdDoctorId = validDoctorRes.body.data.id;

    // Verify row in MySQL
    const [dbDoctorRows] = await pool.query('SELECT * FROM doctor WHERE doctor_id = ?;', [createdDoctorId]);
    assert(dbDoctorRows.length === 1, 'Doctor row confirmed present in MySQL database');
    assert(dbDoctorRows[0].doctor_name === 'Dr. Synthetic Test', 'MySQL doctor_name matches');
    assert(dbDoctorRows[0].specialization === 'Neurologist', 'MySQL specialization matches');

    // -------------------------------------------------------------
    // 8. PUT /api/doctors/:id: Validation & Edit
    // -------------------------------------------------------------
    console.log('\n--- 8. Testing PUT /api/doctors/:id: Editing Doctor ---');
    
    // Validation: 404 on non-existent doctor
    const editDoctorNotFoundRes = await request('PUT', '/api/doctors/999999', { name: 'Ghost', specialization: 'None' });
    assert(editDoctorNotFoundRes.status === 404, 'PUT returns 404 for non-existent doctor');

    // Validation: Rejects empty name
    const editDoctorEmptyNameRes = await request('PUT', `/api/doctors/${createdDoctorId}`, { name: '' });
    assert(editDoctorEmptyNameRes.status === 400, 'PUT rejects empty doctor name with 400 Bad Request');

    // Valid update
    const validEditDoctorRes = await request('PUT', `/api/doctors/${createdDoctorId}`, {
      name: 'Dr. Updated Test',
      specialization: 'Chief of Neurology'
    });
    assert(validEditDoctorRes.status === 200, 'PUT updates doctor with 200 OK');
    assert(validEditDoctorRes.body.success === true, 'Response has success: true');
    assert(validEditDoctorRes.body.data.name === 'Dr. Updated Test', 'Response reflects updated doctor name');
    assert(validEditDoctorRes.body.data.specialization === 'Chief of Neurology', 'Response reflects updated specialization');

    // Verify MySQL update
    const [dbUpdatedDoctor] = await pool.query('SELECT * FROM doctor WHERE doctor_id = ?;', [createdDoctorId]);
    assert(dbUpdatedDoctor[0].doctor_name === 'Dr. Updated Test', 'MySQL verified updated doctor_name');
    assert(dbUpdatedDoctor[0].specialization === 'Chief of Neurology', 'MySQL verified updated specialization');

    // -------------------------------------------------------------
    // 9. Prescription Integration with Updated Patient & Doctor
    // -------------------------------------------------------------
    console.log('\n--- 9. Testing Prescription Integration with New Patient & Doctor ---');
    const rxRes = await request('POST', '/api/prescriptions', {
      patientId: createdPatientId,
      doctorId: createdDoctorId,
      prescriptionDate: '2026-10-24',
      items: [
        { medicineId: 1, dosage: '1 tablet once daily', quantity: 15 }
      ]
    });
    assert(rxRes.status === 201, 'Prescription successfully created using new patient & doctor');
    assert(rxRes.body.success === true, 'Response has success: true');
    createdPrescriptionId = rxRes.body.data ? (rxRes.body.data.id || rxRes.body.data.prescriptionId) : null;

    // Verify prescription query joined details
    const getRxRes = await request('GET', `/api/prescriptions/${createdPrescriptionId}`);
    assert(getRxRes.status === 200, 'GET /api/prescriptions/:id returns 200 OK');
    assert(getRxRes.body.data.patientName === 'Updated Test Patient', 'Prescription joined patientName matches updated patient');
    assert(getRxRes.body.data.doctorName === 'Dr. Updated Test', 'Prescription joined doctorName matches updated doctor');

    // -------------------------------------------------------------
    // 10. Verify Pre-existing Data Intact
    // -------------------------------------------------------------
    console.log('\n--- 10. Verifying Pre-existing Business Records Intact ---');
    const [p1] = await pool.query('SELECT * FROM patient WHERE patient_id = 1;');
    assert(p1.length === 1 && p1[0].patient_name === 'Rahul Sharma', 'Patient 1 (Rahul Sharma) is intact');
    const [d1] = await pool.query('SELECT * FROM doctor WHERE doctor_id = 1;');
    assert(d1.length === 1 && d1[0].doctor_name === 'Dr. Anil Kumar', 'Doctor 1 (Dr. Anil Kumar) is intact');

  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  } finally {
    // Cleanup synthetic test records
    console.log('\n--- Cleaning up synthetic test records from MySQL ---');
    try {
      if (createdPrescriptionId) {
        await pool.query('DELETE FROM prescriptionitem WHERE prescription_id = ?;', [createdPrescriptionId]);
        await pool.query('DELETE FROM prescription WHERE prescription_id = ?;', [createdPrescriptionId]);
        console.log(`✓ Cleaned up test prescription #${createdPrescriptionId}`);
      } else if (createdPatientId) {
        const [rxRows] = await pool.query('SELECT prescription_id FROM prescription WHERE patient_id = ?;', [createdPatientId]);
        for (const r of rxRows) {
          await pool.query('DELETE FROM prescriptionitem WHERE prescription_id = ?;', [r.prescription_id]);
          await pool.query('DELETE FROM prescription WHERE prescription_id = ?;', [r.prescription_id]);
        }
      }
      if (createdPatientId) {
        await pool.query('DELETE FROM patient WHERE patient_id = ?;', [createdPatientId]);
        console.log(`✓ Cleaned up test patient #${createdPatientId}`);
      }
      if (createdDoctorId) {
        await pool.query('DELETE FROM doctor WHERE doctor_id = ?;', [createdDoctorId]);
        console.log(`✓ Cleaned up test doctor #${createdDoctorId}`);
      }
    } catch (cleanErr) {
      console.warn('Warning during test cleanup:', cleanErr.message);
    }

    if (testServer) testServer.close();
    await pool.end();

    console.log('\n=============================================================');
    console.log(`🏁 Phase 4E Test Summary: ${passed} passed, ${failed} failed`);
    console.log('=============================================================');

    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
