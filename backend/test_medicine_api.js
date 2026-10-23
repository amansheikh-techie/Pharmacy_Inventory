// =====================================================================
// Phase 3D: Comprehensive Automated Test Suite for Medicine APIs
// Tests POST /api/medicines, PUT /api/medicines/:id, and GET /api/medicines
// =====================================================================

const http = require('http');
const express = require('express');
const medicineRoutes = require('./routes/medicineRoutes');
const batchRoutes = require('./routes/batchRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { pool } = require('./db');

// Set up isolated Express test server
const app = express();
app.use(express.json());
app.use('/api/medicines', medicineRoutes);
app.use('/api/batches', batchRoutes);
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

async function runTests() {
  console.log('=============================================================');
  console.log('🧪 Starting Medicine API Test Suite');
  console.log('=============================================================');

  // Start test server on random open port
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

  let createdMedicineId = null;
  let createdBatchMedicineId = null;

  try {
    // -----------------------------------------------------------------
    // TEST 1: GET /api/medicines - Retrieve all medicines
    // -----------------------------------------------------------------
    console.log('\n--- 1. Testing GET /api/medicines ---');
    const getRes = await request('GET', '/api/medicines');
    assert(getRes.status === 200, 'GET /api/medicines returns 200 OK');
    assert(getRes.body.success === true, 'Response body has success: true');
    assert(Array.isArray(getRes.body.data), 'Response data is an array');
    assert(getRes.body.data.length > 0, `Returned ${getRes.body.data.length} medicines`);

    // -----------------------------------------------------------------
    // TEST 2: GET /api/medicines/categories - Retrieve categories
    // -----------------------------------------------------------------
    console.log('\n--- 2. Testing GET /api/medicines/categories ---');
    const catRes = await request('GET', '/api/medicines/categories');
    assert(catRes.status === 200, 'GET /api/medicines/categories returns 200 OK');
    assert(catRes.body.success === true, 'Categories response has success: true');
    assert(Array.isArray(catRes.body.data) && catRes.body.data.length > 0, `Returned ${catRes.body.data.length} categories`);

    // -----------------------------------------------------------------
    // TEST 3: POST /api/medicines - Validation: Missing name
    // -----------------------------------------------------------------
    console.log('\n--- 3. Testing POST /api/medicines Validation: Missing Name ---');
    const noNameRes = await request('POST', '/api/medicines', {
      name: '',
      categoryId: 1
    });
    assert(noNameRes.status === 400, 'Rejects empty medicine name with 400 Bad Request');
    assert(noNameRes.body.success === false, 'Returns success: false');
    assert(noNameRes.body.error && noNameRes.body.error.includes('required'), 'Error message mentions required name');

    // -----------------------------------------------------------------
    // TEST 4: POST /api/medicines - Validation: Non-existent category
    // -----------------------------------------------------------------
    console.log('\n--- 4. Testing POST /api/medicines Validation: Invalid Category ---');
    const badCatRes = await request('POST', '/api/medicines', {
      name: 'Test Medicine Invalid Cat',
      categoryId: 99999
    });
    assert(badCatRes.status === 400, 'Rejects non-existent category ID with 400 Bad Request');
    assert(badCatRes.body.success === false, 'Returns success: false');
    assert(badCatRes.body.error && badCatRes.body.error.includes('does not exist'), 'Error indicates referenced category does not exist');

    // -----------------------------------------------------------------
    // TEST 5: POST /api/medicines - Create valid standalone medicine
    // -----------------------------------------------------------------
    console.log('\n--- 5. Testing POST /api/medicines: Valid Standalone Medicine ---');
    const uniqueMedName = `Test Med ${Date.now()}`;
    const validPostRes = await request('POST', '/api/medicines', {
      name: uniqueMedName,
      categoryId: 1, // 'Tablets'
      manufacturer: 'Alpha Pharma Global'
    });
    assert(validPostRes.status === 201, 'Creates medicine with 201 Created');
    assert(validPostRes.body.success === true, 'Response body has success: true');
    assert(validPostRes.body.data && validPostRes.body.data.id > 0, `Created medicine with ID: ${validPostRes.body.data.id}`);
    assert(validPostRes.body.data.name === uniqueMedName, 'Saved name matches');
    assert(validPostRes.body.data.manufacturer === 'Alpha Pharma Global', 'Saved manufacturer matches');
    createdMedicineId = validPostRes.body.data.id;

    // -----------------------------------------------------------------
    // TEST 6: POST /api/medicines - Create valid medicine WITH batch
    // -----------------------------------------------------------------
    console.log('\n--- 6. Testing POST /api/medicines: Medicine with Initial Batch ---');
    const uniqueBatchNumber = `BT-${Date.now().toString().slice(-6)}`;
    const batchMedName = `Amoxicillin Test ${Date.now().toString().slice(-4)}`;
    const validBatchPostRes = await request('POST', '/api/medicines', {
      name: batchMedName,
      categoryId: 3, // 'Capsules'
      manufacturer: 'Beta Health Labs',
      batchNumber: uniqueBatchNumber,
      expiryDate: '2028-06-30',
      quantity: 150,
      unitPrice: 12.75
    });
    assert(validBatchPostRes.status === 201, 'Creates medicine and batch with 201 Created');
    assert(validBatchPostRes.body.data.initialBatch !== undefined, 'Returns initialBatch object');
    assert(validBatchPostRes.body.data.initialBatch.batchNumber === uniqueBatchNumber, 'Batch number matches');
    assert(validBatchPostRes.body.data.totalStock === 150, 'Total stock reflects initial batch (150)');
    createdBatchMedicineId = validBatchPostRes.body.data.id;

    // -----------------------------------------------------------------
    // TEST 7: POST /api/medicines - Duplicate batch constraint error
    // -----------------------------------------------------------------
    console.log('\n--- 7. Testing POST /api/medicines: Duplicate Batch Constraint ---');
    const dupBatchRes = await request('POST', '/api/medicines', {
      name: 'Another Medicine Same Batch',
      categoryId: 1,
      batchNumber: uniqueBatchNumber, // Already used
      expiryDate: '2028-06-30',
      quantity: 50,
      unitPrice: 10.00
    });
    assert(dupBatchRes.status === 409, 'Rejects duplicate batch number with 409 Conflict');
    assert(dupBatchRes.body.success === false, 'Returns success: false on duplicate key');

    // -----------------------------------------------------------------
    // TEST 8: GET /api/medicines/:id - Fetch created medicine
    // -----------------------------------------------------------------
    console.log('\n--- 8. Testing GET /api/medicines/:id ---');
    const getByIdRes = await request('GET', `/api/medicines/${createdBatchMedicineId}`);
    assert(getByIdRes.status === 200, 'GET /api/medicines/:id returns 200 OK');
    assert(getByIdRes.body.data.name === batchMedName, 'Fetched name matches');
    assert(Array.isArray(getByIdRes.body.data.batches) && getByIdRes.body.data.batches.length === 1, 'Batches array contains 1 batch');

    // -----------------------------------------------------------------
    // TEST 9: PUT /api/medicines/:id - Edit an existing medicine
    // -----------------------------------------------------------------
    console.log('\n--- 9. Testing PUT /api/medicines/:id: Valid Edit ---');
    const updatedName = `${uniqueMedName} (Updated)`;
    const editRes = await request('PUT', `/api/medicines/${createdMedicineId}`, {
      name: updatedName,
      categoryId: 2, // 'Syrups'
      manufacturer: 'Alpha Pharma Revised'
    });
    assert(editRes.status === 200, 'PUT /api/medicines/:id returns 200 OK');
    assert(editRes.body.success === true, 'Returns success: true');
    assert(editRes.body.data.name === updatedName, 'Updated name matches in response');
    assert(editRes.body.data.categoryId === 2, 'Updated categoryId matches (2)');
    assert(editRes.body.data.categoryName === 'Syrups', 'Updated categoryName matches "Syrups"');
    assert(editRes.body.data.manufacturer === 'Alpha Pharma Revised', 'Updated manufacturer matches');

    // Verify change in MySQL via GET
    const verifyGet = await request('GET', `/api/medicines/${createdMedicineId}`);
    assert(verifyGet.body.data.name === updatedName, 'Verified updated name in MySQL');
    assert(verifyGet.body.data.categoryName === 'Syrups', 'Verified updated category in MySQL');

    // -----------------------------------------------------------------
    // TEST 10: PUT /api/medicines/:id - Reject non-existent medicine
    // -----------------------------------------------------------------
    console.log('\n--- 10. Testing PUT /api/medicines/:id: Medicine Not Found ---');
    const notFoundEditRes = await request('PUT', '/api/medicines/999999', {
      name: 'Ghost Medicine'
    });
    assert(notFoundEditRes.status === 404, 'Returns 404 Not Found for non-existent medicine ID');
    assert(notFoundEditRes.body.success === false, 'Returns success: false');

    // -----------------------------------------------------------------
    // TEST 11: PUT /api/medicines/:id - Reject invalid medicine ID
    // -----------------------------------------------------------------
    console.log('\n--- 11. Testing PUT /api/medicines/:id: Invalid ID ---');
    const badIdEditRes = await request('PUT', '/api/medicines/invalid-id', {
      name: 'Test'
    });
    assert(badIdEditRes.status === 400, 'Returns 400 Bad Request for non-numeric ID');

    // -----------------------------------------------------------------
    // TEST 13: GET /api/batches - Retrieve all inventory batches
    // -----------------------------------------------------------------
    console.log('\n--- 13. Testing GET /api/batches ---');
    const getBatchesRes = await request('GET', '/api/batches');
    assert(getBatchesRes.status === 200, 'GET /api/batches returns 200 OK');
    assert(getBatchesRes.body.success === true, 'Response body has success: true');
    assert(Array.isArray(getBatchesRes.body.data), 'Batches data is an array');
    assert(getBatchesRes.body.data.length > 0, `Returned ${getBatchesRes.body.data.length} live batches from MySQL`);
    assert(getBatchesRes.body.data[0].daysToExpiry !== undefined, 'Calculates daysToExpiry for FEFO auditing');

    // -----------------------------------------------------------------
    // TEST 14: POST /api/batches - Validation: Missing medicine ID
    // -----------------------------------------------------------------
    console.log('\n--- 14. Testing POST /api/batches Validation: Missing Medicine ---');
    const badBatchMedRes = await request('POST', '/api/batches', {
      batchNumber: 'BT-TEST-X',
      quantity: 50,
      unitPrice: 5.0,
      expiryDate: '2028-01-01'
    });
    assert(badBatchMedRes.status === 400, 'Rejects missing medicineId with 400 Bad Request');

    // -----------------------------------------------------------------
    // TEST 15: POST /api/batches - Create valid new batch
    // -----------------------------------------------------------------
    console.log('\n--- 15. Testing POST /api/batches: Valid Batch ---');
    const standaloneBatchNum = `BTEST-${Date.now().toString().slice(-5)}`;
    const createBatchRes = await request('POST', '/api/batches', {
      medicineId: createdMedicineId,
      batchNumber: standaloneBatchNum,
      quantity: 120,
      unitPrice: 6.25,
      expiryDate: '2028-09-30'
    });
    assert(createBatchRes.status === 201, 'Creates batch with 201 Created');
    assert(createBatchRes.body.success === true, 'Returns success: true');
    assert(createBatchRes.body.data.batchNumber === standaloneBatchNum, 'Saved batch number matches');
    assert(createBatchRes.body.data.stock === 120, 'Saved quantity matches (120)');
    const createdBatchId = createBatchRes.body.data.id;

    // -----------------------------------------------------------------
    // TEST 16: POST /api/batches - Reject duplicate batch number
    // -----------------------------------------------------------------
    console.log('\n--- 16. Testing POST /api/batches: Duplicate Batch Number ---');
    const dupBatchNumRes = await request('POST', '/api/batches', {
      medicineId: createdMedicineId,
      batchNumber: standaloneBatchNum,
      quantity: 20,
      unitPrice: 6.25,
      expiryDate: '2028-09-30'
    });
    assert(dupBatchNumRes.status === 409, 'Rejects duplicate batch number with 409 Conflict');

    // -----------------------------------------------------------------
    // TEST 17: PUT /api/batches/:id - Update batch stock & pricing
    // -----------------------------------------------------------------
    console.log('\n--- 17. Testing PUT /api/batches/:id: Valid Edit ---');
    const updateBatchRes = await request('PUT', `/api/batches/${createdBatchId}`, {
      quantity: 140,
      unitPrice: 7.00,
      expiryDate: '2028-10-31'
    });
    assert(updateBatchRes.status === 200, 'Updates batch with 200 OK');
    assert(updateBatchRes.body.data.stock === 140, 'Updated stock reflects 140 in response');
    assert(parseFloat(updateBatchRes.body.data.sellingPrice) === 7.00, 'Updated price reflects 7.00');

    // -----------------------------------------------------------------
    // TEST 18: PUT /api/batches/:id - Reject non-existent batch
    // -----------------------------------------------------------------
    console.log('\n--- 18. Testing PUT /api/batches/:id: Not Found ---');
    const notFoundBatchRes = await request('PUT', '/api/batches/999999', {
      quantity: 10
    });
    assert(notFoundBatchRes.status === 404, 'Returns 404 for non-existent batch');

    // -----------------------------------------------------------------
    // TEST 19: DELETE /api/batches/:id - Delete created test batch
    // -----------------------------------------------------------------
    console.log('\n--- 19. Testing DELETE /api/batches/:id ---');
    const deleteBatchRes = await request('DELETE', `/api/batches/${createdBatchId}`);
    assert(deleteBatchRes.status === 200, 'Deletes test batch with 200 OK');
    assert(deleteBatchRes.body.success === true, 'Returns success: true on delete');

    // -----------------------------------------------------------------
    // TEST 20: GET /api/reports/low-stock - Stored procedure GetLowStock()
    // -----------------------------------------------------------------
    console.log('\n--- 20. Testing GET /api/reports/low-stock: GetLowStock() ---');
    const lowStockRes = await request('GET', '/api/reports/low-stock');
    assert(lowStockRes.status === 200, 'GET /api/reports/low-stock returns 200 OK');
    assert(lowStockRes.body.success === true, 'Response body has success: true');
    assert(Array.isArray(lowStockRes.body.data), 'Low stock data is an array');
    assert(lowStockRes.body.threshold === 30, 'Report threshold matches schema < 30 units');
    // Antiseptic Ointment (OIN101) has 25 units (< 30)
    const oinMatch = lowStockRes.body.data.find(b => b.batchNumber === 'OIN101');
    assert(Boolean(oinMatch), 'GetLowStock identifies OIN101 (quantity 25 < 30)');
    if (oinMatch) {
      assert(oinMatch.stock === 25, 'Identified low stock batch has 25 units');
    }

    // -----------------------------------------------------------------
    // TEST 21: GET /api/reports/expiry - Stored procedure GetExpiryReport()
    // -----------------------------------------------------------------
    console.log('\n--- 21. Testing GET /api/reports/expiry: GetExpiryReport() ---');
    const expiryReportRes = await request('GET', '/api/reports/expiry');
    assert(expiryReportRes.status === 200, 'GET /api/reports/expiry returns 200 OK');
    assert(expiryReportRes.body.success === true, 'Response body has success: true');
    assert(Array.isArray(expiryReportRes.body.data), 'Expiry report data is an array');

    // Test expiry status logic: Create a temporary test batch expiring in 15 days
    // to test expiring-soon classification, and one expired in past
    const expiringSoonNumber = `EXPSOON-${Date.now().toString().slice(-5)}`;
    const postSoonBatch = await request('POST', '/api/batches', {
      medicineId: 1, // Paracetamol
      batchNumber: expiringSoonNumber,
      quantity: 50,
      unitPrice: 3.50,
      expiryDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10)
    });
    assert(postSoonBatch.status === 201, 'Creates batch expiring in 15 days');
    const soonBatchId = postSoonBatch.body.data.id;

    // Check expiry report now includes the expiring soon batch
    const updatedExpiryRes = await request('GET', '/api/reports/expiry');
    const soonItem = updatedExpiryRes.body.data.find(b => b.batchNumber === expiringSoonNumber);
    assert(Boolean(soonItem), 'GetExpiryReport includes batch expiring in 15 days');
    if (soonItem) {
      assert(soonItem.isExpired === false, 'Batch expiring in 15 days is NOT labeled as expired');
      assert(soonItem.badgeType === 'warning', 'Badge type is warning (expiring soon)');
      assert(soonItem.daysRemaining >= 14 && soonItem.daysRemaining <= 16, 'Days remaining calculated accurately');
    }

    // Clean up temporary soon batch
    await request('DELETE', `/api/batches/${soonBatchId}`);

    // -----------------------------------------------------------------
    // TEST 22: PUT /api/batches/:id - Stock integrity protection on sold batches
    // -----------------------------------------------------------------
    console.log('\n--- 22. Testing Stock Integrity Protection on Batch with Sales ---');
    // Batch 1 (PAR101) has completed sales recorded in saleitem
    const attemptQtyOverrideRes = await request('PUT', '/api/batches/1', {
      quantity: 999
    });
    assert(attemptQtyOverrideRes.status === 409, 'Rejects arbitrary quantity override on sold batch with 409 Conflict');
    assert(attemptQtyOverrideRes.body.success === false, 'Returns success: false');
    assert(attemptQtyOverrideRes.body.error.includes('Stock integrity protection'), 'Error explains stock integrity requirement');
    assert(attemptQtyOverrideRes.body.details.reconciliationRequired === true, 'Identifies reconciliation workflow required');

    // Updating non-quantity fields (e.g. unitPrice) on sold batch is permitted
    const allowPriceUpdateRes = await request('PUT', '/api/batches/1', {
      unitPrice: 2.50
    });
    assert(allowPriceUpdateRes.status === 200, 'Permits unitPrice update on sold batch');

    // -----------------------------------------------------------------
    // TEST 23: Database Triggers Preservation Verification
    // -----------------------------------------------------------------
    console.log('\n--- 23. Verifying Stock Triggers Intact in MySQL ---');
    const [activeTriggers] = await pool.query(
      'SELECT TRIGGER_NAME, EVENT_OBJECT_TABLE FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = "pharmacy_db"'
    );
    const triggerNames = activeTriggers.map(t => t.TRIGGER_NAME.toLowerCase());
    assert(triggerNames.includes('check_sale_stock'), 'Trigger check_sale_stock is active in MySQL');
    assert(triggerNames.includes('after_saleitem_insert'), 'Trigger after_saleitem_insert is active in MySQL');

    // -----------------------------------------------------------------
    // TEST 24: Stored Procedures Preservation Verification
    // -----------------------------------------------------------------
    console.log('\n--- 24. Verifying Stored Procedures Intact in MySQL ---');
    const [activeRoutines] = await pool.query(
      'SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = "pharmacy_db"'
    );
    const routineNames = activeRoutines.map(r => r.ROINE_NAME ? r.ROINE_NAME.toLowerCase() : r.ROUTINE_NAME.toLowerCase());
    assert(routineNames.includes('getlowstock'), 'Stored procedure GetLowStock is registered');
    assert(routineNames.includes('getexpiryreport'), 'Stored procedure GetExpiryReport is registered');

  } catch (err) {
    console.error('Unexpected test error:', err);
    testsFailed++;
  } finally {
    // Clean up created test data from database
    console.log('\n--- Cleaning up test records from database ---');
    try {
      if (createdBatchMedicineId) {
        await pool.query('DELETE FROM medicinebatch WHERE medicine_id = ?', [createdBatchMedicineId]);
        await pool.query('DELETE FROM medicine WHERE medicine_id = ?', [createdBatchMedicineId]);
        console.log(`✓ Cleaned up test medicine batch ID ${createdBatchMedicineId}`);
      }
      if (createdMedicineId) {
        await pool.query('DELETE FROM medicinebatch WHERE medicine_id = ?', [createdMedicineId]);
        await pool.query('DELETE FROM medicine WHERE medicine_id = ?', [createdMedicineId]);
        console.log(`✓ Cleaned up test medicine ID ${createdMedicineId}`);
      }
    } catch (cleanupErr) {
      console.warn('Cleanup warning:', cleanupErr.message);
    }

    if (server) server.close();
    await pool.end();

    console.log('\n=============================================================');
    console.log(`🏁 Test Summary: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('=============================================================');

    if (testsFailed > 0) {
      process.exit(1);
    }
  }
}

runTests();
