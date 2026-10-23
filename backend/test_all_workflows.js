// =====================================================================
// End-to-End Verification Test Suite: 14 Essential Workflows
// Technology: Node.js + Express + mysql2/promise (pharmacy_db)
// Tests:
//  1. Open the dashboard (health & summary).
//  2. Add a medicine and verify it appears in MySQL.
//  3. Edit a medicine and verify changes in MySQL.
//  4. Add an inventory batch for this medicine.
//  5. View inventory and expiry information.
//  6. Create a sale and verify the sale total calculation.
//  7. Verify sold quantities are deducted exactly once (no double-deduction).
//  8. Attempt to sell more than available stock and confirm rejection (409).
//  9. Verify failed multi-item sales roll back completely (atomic rollback).
// 10. Create a prescription and verify associated items in PrescriptionItem.
// 11. Verify creating a prescription does not deduct inventory or create a sale.
// 12. Add and edit patient and doctor records.
// 13. Open low-stock and expiry reports (GetLowStock & GetExpiryReport).
// 14. Refresh frontend APIs and verify saved data remains available.
// =====================================================================

const http = require('http');
const express = require('express');
const { pool } = require('./db');

const medicineRoutes = require('./routes/medicineRoutes');
const batchRoutes = require('./routes/batchRoutes');
const salesRoutes = require('./routes/salesRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
app.use(express.json());
app.use('/api/medicines', medicineRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/reports', reportRoutes);

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
      headers: { 'Content-Type': 'application/json' }
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

async function runAllWorkflowTests() {
  console.log('=====================================================================');
  console.log(' 🏥 Pharmacy Inventory PBL: 14 Essential Workflows Verification');
  console.log(' Database: pharmacy_db on localhost:3306');
  console.log('=====================================================================\n');

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

  // Cleanup tracker
  const created = {
    medicineIds: [],
    batchIds: [],
    saleIds: [],
    prescriptionIds: [],
    patientIds: [],
    doctorId: null
  };

  try {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`Ephemeral test server running at ${baseUrl}\n`);
        resolve();
      });
    });

    // -----------------------------------------------------------------
    // WORKFLOW 1: Open the dashboard
    // -----------------------------------------------------------------
    console.log('[WORKFLOW 1] Open the dashboard');
    const dashRes = await request('GET', '/api/reports/dashboard-summary');
    assert(dashRes.status === 200, `Dashboard summary responds 200 (got ${dashRes.status})`);
    assert(dashRes.body.success === true, 'Dashboard summary has success: true');
    assert(typeof dashRes.body.data.totalMedicines === 'number', 'Contains totalMedicines metric');
    assert(typeof dashRes.body.data.totalStock === 'number', 'Contains totalStock metric');
    assert(typeof dashRes.body.data.lowStockBatches === 'number', 'Contains lowStockBatches metric');
    assert(typeof dashRes.body.data.expiredBatches === 'number', 'Contains expiredBatches metric');
    assert(typeof dashRes.body.data.totalSales === 'number', 'Contains totalSales metric');
    assert(typeof dashRes.body.data.totalSalesAmount === 'number', 'Contains totalSalesAmount metric');

    // -----------------------------------------------------------------
    // WORKFLOW 2: Add a medicine and verify it appears in MySQL
    // -----------------------------------------------------------------
    console.log('\n[WORKFLOW 2] Add a medicine and verify it appears in MySQL');
    const uniqueSuffix = Date.now().toString().slice(-5);
    const testMedPayload = {
      name: `Stabilization Med ${uniqueSuffix}`,
      generic: 'Amoxicillin Trihydrate',
      categoryId: 1,
      manufacturer: 'PharmaCore Labs'
    };

    const addMedRes = await request('POST', '/api/medicines', testMedPayload);
    assert(addMedRes.status === 201, `POST /api/medicines created (got ${addMedRes.status})`);
    assert(addMedRes.body.success === true, 'Medicine response has success: true');
    const newMedId = addMedRes.body.data.id;
    created.medicineIds.push(newMedId);
    assert(newMedId > 0, `Created medicine ID is valid (${newMedId})`);

    // Verify directly in MySQL
    const [medInDb] = await pool.query('SELECT * FROM medicine WHERE medicine_id = ?', [newMedId]);
    assert(medInDb.length === 1, `Medicine #${newMedId} found in MySQL`);
    assert(medInDb[0].medicine_name === testMedPayload.name, `Medicine name verified in MySQL ("${medInDb[0].medicine_name}")`);
    assert(medInDb[0].category_id === 1, 'Category ID verified in MySQL (1)');

    // -----------------------------------------------------------------
    // WORKFLOW 3: Edit a medicine and verify the changes
    // -----------------------------------------------------------------
    console.log('\n[WORKFLOW 3] Edit a medicine and verify the changes');
    const updatedMedName = `Stabilization Med ${uniqueSuffix} EDITED`;
    const editMedRes = await request('PUT', `/api/medicines/${newMedId}`, {
      name: updatedMedName,
      generic: 'Amoxicillin Potassium Clavulanate',
      categoryId: 2,
      manufacturer: 'PharmaCore Labs International'
    });
    assert(editMedRes.status === 200, `PUT /api/medicines/:id updated 200 (got ${editMedRes.status})`);
    assert(editMedRes.body.success === true, 'Update response has success: true');

    // Verify changes directly in MySQL
    const [medEditedInDb] = await pool.query('SELECT * FROM medicine WHERE medicine_id = ?', [newMedId]);
    assert(medEditedInDb[0].medicine_name === updatedMedName, `Updated name verified in MySQL ("${medEditedInDb[0].medicine_name}")`);
    assert(medEditedInDb[0].category_id === 2, 'Updated category verified in MySQL (2)');

    // -----------------------------------------------------------------
    // WORKFLOW 4: Add an inventory batch
    // -----------------------------------------------------------------
    console.log('\n[WORKFLOW 4] Add an inventory batch');
    const batchNumber = `BT-STAB-${uniqueSuffix}`;
    const initialBatchStock = 60;
    const batchUnitPrice = 15.50;
    const addBatchRes = await request('POST', '/api/batches', {
      medicineId: newMedId,
      batchNumber,
      expiryDate: '2028-06-30',
      unitPrice: batchUnitPrice,
      quantity: initialBatchStock
    });
    assert(addBatchRes.status === 201, `POST /api/batches created 201 (got ${addBatchRes.status})`);
    assert(addBatchRes.body.success === true, 'Batch response has success: true');
    const newBatchId = addBatchRes.body.data.id;
    created.batchIds.push(newBatchId);

    // Verify batch in MySQL
    const [batchInDb] = await pool.query('SELECT * FROM medicinebatch WHERE batch_id = ?', [newBatchId]);
    assert(batchInDb.length === 1, `Batch #${newBatchId} found in MySQL`);
    assert(batchInDb[0].quantity === initialBatchStock, `Batch stock verified at ${initialBatchStock} units`);
    assert(parseFloat(batchInDb[0].unit_price) === batchUnitPrice, `Batch unit price verified at ₹${batchUnitPrice}`);

    // -----------------------------------------------------------------
    // WORKFLOW 5: View inventory and expiry information
    // -----------------------------------------------------------------
    console.log('\n[WORKFLOW 5] View inventory and expiry information');
    const getBatchesRes = await request('GET', '/api/batches');
    assert(getBatchesRes.status === 200, 'GET /api/batches returns 200');
    const foundBatch = getBatchesRes.body.data.find(b => b.id === newBatchId);
    assert(foundBatch !== undefined, `Created batch #${newBatchId} appears in inventory listing`);
    assert(foundBatch.daysToExpiry > 0, `Batch has valid positive daysToExpiry (${foundBatch.daysToExpiry} days)`);
    assert(foundBatch.statusType === 'in-stock', 'Batch statusType is in-stock');

    // -----------------------------------------------------------------
    // WORKFLOW 6: Create a sale and verify the sale total
    // -----------------------------------------------------------------
    console.log('\n[WORKFLOW 6] Create a sale and verify the sale total');
    const sellQty = 4;
    const expectedSaleTotal = parseFloat((sellQty * batchUnitPrice).toFixed(2)); // 4 * 15.50 = 62.00
    const saleRes = await request('POST', '/api/sales', {
      items: [
        { batchId: newBatchId, quantity: sellQty }
      ]
    });
    assert(saleRes.status === 201, `POST /api/sales created 201 (got ${saleRes.status})`);
    assert(saleRes.body.success === true, 'Sale response has success: true');
    const newSaleId = saleRes.body.data.saleId;
    created.saleIds.push(newSaleId);
    assert(parseFloat(saleRes.body.data.totalAmount) === expectedSaleTotal, 
      `Sale total amount is accurately ₹${expectedSaleTotal} (got ₹${saleRes.body.data.totalAmount})`);

    // -----------------------------------------------------------------
    // WORKFLOW 7: Verify that sold quantities are deducted exactly once
    // -----------------------------------------------------------------
    console.log('\n[WORKFLOW 7] Verify that sold quantities are deducted exactly once');
    const [batchAfterSale] = await pool.query('SELECT quantity FROM medicinebatch WHERE batch_id = ?', [newBatchId]);
    const expectedRemaining = initialBatchStock - sellQty; // 60 - 4 = 56
    assert(batchAfterSale[0].quantity === expectedRemaining, 
      `Batch stock deducted exactly once: ${initialBatchStock} - ${sellQty} = ${batchAfterSale[0].quantity} (expected: ${expectedRemaining})`);

    // Verify sale total in MySQL matches
    const [saleInDb] = await pool.query('SELECT total_amount FROM sale WHERE sale_id = ?', [newSaleId]);
    assert(parseFloat(saleInDb[0].total_amount) === expectedSaleTotal, 
      `Sale total_amount in MySQL matches ₹${expectedSaleTotal}`);

    // -----------------------------------------------------------------
    // WORKFLOW 8: Attempt to sell more than available stock and confirm rejection
    // -----------------------------------------------------------------
    console.log('\n[WORKFLOW 8] Attempt to sell more than available stock and confirm rejection');
    const excessiveQty = expectedRemaining + 50; // 56 + 50 = 106
    const oversellRes = await request('POST', '/api/sales', {
      items: [
        { batchId: newBatchId, quantity: excessiveQty }
      ]
    });
    assert(oversellRes.status === 409, `Oversell correctly rejected with 409 Conflict (got ${oversellRes.status})`);
    assert(oversellRes.body.success === false, 'Oversell response has success: false');

    // Confirm stock remained intact
    const [batchAfterOversell] = await pool.query('SELECT quantity FROM medicinebatch WHERE batch_id = ?', [newBatchId]);
    assert(batchAfterOversell[0].quantity === expectedRemaining, 
      `Stock remains strictly protected at ${expectedRemaining} units`);

    // -----------------------------------------------------------------
    // WORKFLOW 9: Verify that failed multi-item sales roll back completely
    // -----------------------------------------------------------------
    console.log('\n[WORKFLOW 9] Verify that failed multi-item sales roll back completely');
    const [salesCountBefore] = await pool.query('SELECT COUNT(*) AS total FROM sale');
    const [saleItemsCountBefore] = await pool.query('SELECT COUNT(*) AS total FROM saleitem');

    // Valid item 1 + Invalid item 2 (excessive quantity)
    const multiItemFailRes = await request('POST', '/api/sales', {
      items: [
        { batchId: newBatchId, quantity: 2 },
        { batchId: newBatchId, quantity: 9999 }
      ]
    });
    assert(multiItemFailRes.status === 409, `Multi-item failure rejected with 409 (got ${multiItemFailRes.status})`);

    const [salesCountAfter] = await pool.query('SELECT COUNT(*) AS total FROM sale');
    const [saleItemsCountAfter] = await pool.query('SELECT COUNT(*) AS total FROM saleitem');
    const [batchAfterFail] = await pool.query('SELECT quantity FROM medicinebatch WHERE batch_id = ?', [newBatchId]);

    assert(salesCountAfter[0].total === salesCountBefore[0].total, 
      'Sale master table row count unchanged (atomic rollback confirmed)');
    assert(saleItemsCountAfter[0].total === saleItemsCountBefore[0].total, 
      'SaleItem table row count unchanged (no orphan line items created)');
    assert(batchAfterFail[0].quantity === expectedRemaining, 
      `Batch quantity unchanged at ${expectedRemaining} (no partial deduction occurred)`);

    // -----------------------------------------------------------------
    // WORKFLOW 10: Create a prescription and verify its associated items
    // -----------------------------------------------------------------
    console.log('\n[WORKFLOW 10] Create a prescription and verify its associated items');
    // Ensure we have a valid patient and doctor
    const [patientRows] = await pool.query('SELECT patient_id FROM patient LIMIT 1');
    const [doctorRows] = await pool.query('SELECT doctor_id FROM doctor LIMIT 1');
    const pId = patientRows[0].patient_id;
    const dId = doctorRows[0].doctor_id;

    const rxPayload = {
      patientId: pId,
      doctorId: dId,
      prescriptionDate: '2026-10-24',
      items: [
        { medicineId: newMedId, dosage: '500 mg morning and night', quantity: 14 }
      ]
    };
    const rxRes = await request('POST', '/api/prescriptions', rxPayload);
    assert(rxRes.status === 201, `POST /api/prescriptions created 201 (got ${rxRes.status})`);
    assert(rxRes.body.success === true, 'Prescription response has success: true');
    const newRxId = rxRes.body.data.prescriptionId;
    created.prescriptionIds.push(newRxId);

    // Verify items in prescriptionitem table
    const [rxItems] = await pool.query('SELECT * FROM prescriptionitem WHERE prescription_id = ?', [newRxId]);
    assert(rxItems.length === 1, `Prescription #${newRxId} has 1 item in prescriptionitem table`);
    assert(rxItems[0].medicine_id === newMedId, 'Item medicine_id matches');
    assert(rxItems[0].quantity === 14, 'Item quantity matches 14');
    assert(rxItems[0].dosage === '500 mg morning and night', 'Item dosage matches');

    // -----------------------------------------------------------------
    // WORKFLOW 11: Verify that creating a prescription does not unintentionally deduct inventory
    // -----------------------------------------------------------------
    console.log('\n[WORKFLOW 11] Verify that creating a prescription does not unintentionally deduct inventory');
    const [batchAfterRx] = await pool.query('SELECT quantity FROM medicinebatch WHERE batch_id = ?', [newBatchId]);
    assert(batchAfterRx[0].quantity === expectedRemaining, 
      `Batch quantity remains ${expectedRemaining} (ZERO inventory deducted by prescription creation)`);

    const [salesCountAfterRx] = await pool.query('SELECT COUNT(*) AS total FROM sale');
    assert(salesCountAfterRx[0].total === salesCountBefore[0].total, 
      'Sales count in MySQL unchanged (NO sale created by prescription creation)');

    // -----------------------------------------------------------------
    // WORKFLOW 12: Add and edit a patient and doctor
    // -----------------------------------------------------------------
    console.log('\n[WORKFLOW 12] Add and edit a patient and doctor');
    // Patient Add & Edit
    const patRes = await request('POST', '/api/patients', {
      name: `Test Patient ${uniqueSuffix}`,
      phone: '+91 99999 11111'
    });
    assert(patRes.status === 201, `Patient registered (got ${patRes.status})`);
    const newPatId = patRes.body.data.id;
    created.patientIds.push(newPatId);

    const editPatRes = await request('PUT', `/api/patients/${newPatId}`, {
      name: `Test Patient ${uniqueSuffix} Updated`,
      phone: '+91 99999 22222'
    });
    assert(editPatRes.status === 200, `Patient updated (got ${editPatRes.status})`);

    const [patInDb] = await pool.query('SELECT * FROM patient WHERE patient_id = ?', [newPatId]);
    assert(patInDb[0].patient_name === `Test Patient ${uniqueSuffix} Updated`, 'Patient name verified in MySQL');
    assert(patInDb[0].phone === '+91 99999 22222', 'Patient phone verified in MySQL');

    // Doctor Add & Edit
    const docRes = await request('POST', '/api/doctors', {
      name: `Dr. Verification ${uniqueSuffix}`,
      specialization: 'Pharmacology'
    });
    assert(docRes.status === 201, `Doctor registered (got ${docRes.status})`);
    const newDocId = docRes.body.data.id;
    created.doctorId = newDocId;

    const editDocRes = await request('PUT', `/api/doctors/${newDocId}`, {
      name: `Dr. Verification ${uniqueSuffix} MD`,
      specialization: 'Clinical Pharmacology'
    });
    assert(editDocRes.status === 200, `Doctor updated (got ${editDocRes.status})`);

    const [docInDb] = await pool.query('SELECT * FROM doctor WHERE doctor_id = ?', [newDocId]);
    assert(docInDb[0].doctor_name === `Dr. Verification ${uniqueSuffix} MD`, 'Doctor name verified in MySQL');
    assert(docInDb[0].specialization === 'Clinical Pharmacology', 'Doctor specialization verified in MySQL');

    // -----------------------------------------------------------------
    // WORKFLOW 13: Open the low-stock and expiry reports
    // -----------------------------------------------------------------
    console.log('\n[WORKFLOW 13] Open the low-stock and expiry reports');
    const lowStockRes = await request('GET', '/api/reports/low-stock');
    assert(lowStockRes.status === 200, `Low-stock report responds 200 (got ${lowStockRes.status})`);
    assert(lowStockRes.body.threshold === 30, 'Low-stock threshold verified at 30 units');
    assert(Array.isArray(lowStockRes.body.data), 'Low stock data is an array');

    const expiryRes = await request('GET', '/api/reports/expiry');
    assert(expiryRes.status === 200, `Expiry report responds 200 (got ${expiryRes.status})`);
    assert(expiryRes.body.source.includes('90-day'), 'Expiry report window verified at 90 days');
    assert(Array.isArray(expiryRes.body.data), 'Expiry report data is an array');

    // -----------------------------------------------------------------
    // WORKFLOW 14: Refresh the frontend and verify that saved data remains available
    // -----------------------------------------------------------------
    console.log('\n[WORKFLOW 14] Refresh the frontend and verify that saved data remains available');
    const refreshMed = await request('GET', `/api/medicines/${newMedId}`);
    assert(refreshMed.status === 200, `Medicine #${newMedId} fetched successfully on refresh`);
    assert(refreshMed.body.data.name === updatedMedName, 'Medicine name persists in MySQL');

    const refreshBatch = await request('GET', '/api/batches');
    const persistedBatch = refreshBatch.body.data.find(b => b.id === newBatchId);
    assert(persistedBatch !== undefined, `Batch #${newBatchId} persists in MySQL`);
    assert(persistedBatch.stock === expectedRemaining, `Batch stock persists at ${expectedRemaining} units`);

    const refreshSale = await request('GET', `/api/sales/${newSaleId}`);
    assert(refreshSale.status === 200, `Sale #${newSaleId} persists in MySQL`);
    assert(parseFloat(refreshSale.body.data.totalAmount) === expectedSaleTotal, 'Sale total persists');

    const refreshRx = await request('GET', `/api/prescriptions/${newRxId}`);
    assert(refreshRx.status === 200, `Prescription #${newRxId} persists in MySQL`);
    assert(refreshRx.body.data.items.length === 1, 'Prescription items persist');

    console.log('\n=====================================================================');
    console.log(` 14 Workflows Test Execution: ${passed} PASSED, ${failed} FAILED`);
    console.log('=====================================================================\n');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    // Clean up only temporary test records created during this run
    console.log('--- Cleaning up synthetic test records from MySQL ---');
    try {
      for (const rxId of created.prescriptionIds) {
        await pool.query('DELETE FROM prescriptionitem WHERE prescription_id = ?', [rxId]);
        await pool.query('DELETE FROM prescription WHERE prescription_id = ?', [rxId]);
      }
      for (const sId of created.saleIds) {
        await pool.query('DELETE FROM saleitem WHERE sale_id = ?', [sId]);
        await pool.query('DELETE FROM sale WHERE sale_id = ?', [sId]);
      }
      for (const bId of created.batchIds) {
        await pool.query('DELETE FROM medicinebatch WHERE batch_id = ?', [bId]);
      }
      for (const mId of created.medicineIds) {
        await pool.query('DELETE FROM medicine WHERE medicine_id = ?', [mId]);
      }
      for (const pId of created.patientIds) {
        await pool.query('DELETE FROM patient WHERE patient_id = ?', [pId]);
      }
      if (created.doctorId) {
        await pool.query('DELETE FROM doctor WHERE doctor_id = ?', [created.doctorId]);
      }
      console.log('✓ Successfully cleaned up all synthetic test records without affecting pre-existing data.\n');
    } catch (cleanupErr) {
      console.error('Error during cleanup:', cleanupErr);
    }

    if (server) server.close();
    await pool.end();

    if (failed > 0) {
      process.exit(1);
    }
  }
}

runAllWorkflowTests();
