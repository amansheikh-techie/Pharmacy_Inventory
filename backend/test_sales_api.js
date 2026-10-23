// =====================================================================
// Phase 4C: Comprehensive Automated Test Suite for Sales & Billing APIs
// Tests GET /api/sales, GET /api/sales/:id, POST /api/sales
// Verifies Transaction Safety, Stock Deduction, Total Calculation,
// Trigger Integration, and Rollback on Failure.
// =====================================================================

const http = require('http');
const express = require('express');
const salesRoutes = require('./routes/salesRoutes');
const batchRoutes = require('./routes/batchRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const { pool } = require('./db');

const app = express();
app.use(express.json());
app.use('/api/sales', salesRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/medicines', medicineRoutes);

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

async function runSalesTests() {
  console.log('=============================================================');
  console.log('🧪 Starting Phase 4C Sales & Billing API Test Suite');
  console.log('=============================================================');

  // Start test server on dynamic port
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
  let testMedicineId = null;
  let testBatchAId = null;
  let testBatchBId = null;
  let testBatchExpId = null;
  const createdSaleIds = [];

  try {
    // -----------------------------------------------------------------
    // SETUP: Dedicated Test Medicine & Batches (Preserving Business Data)
    // -----------------------------------------------------------------
    console.log('\n--- Setup: Provisioning Dedicated Test Medicine & Batches ---');
    const [medResult] = await pool.query(
      'INSERT INTO medicine (medicine_name, category_id, manufacturer) VALUES (?, 1, "Test Labs Inc")',
      [`Sales Test Medicine ${Date.now()}`]
    );
    testMedicineId = medResult.insertId;

    const batchANumber = `TS-A-${Date.now().toString().slice(-6)}`;
    const [batchARes] = await pool.query(
      'INSERT INTO medicinebatch (medicine_id, batch_number, quantity, unit_price, expiry_date) VALUES (?, ?, 100, 12.50, "2028-12-31")',
      [testMedicineId, batchANumber]
    );
    testBatchAId = batchARes.insertId;

    const batchBNumber = `TS-B-${Date.now().toString().slice(-6)}`;
    const [batchBRes] = await pool.query(
      'INSERT INTO medicinebatch (medicine_id, batch_number, quantity, unit_price, expiry_date) VALUES (?, ?, 50, 20.00, "2028-12-31")',
      [testMedicineId, batchBNumber]
    );
    testBatchBId = batchBRes.insertId;

    const batchExpNumber = `TS-EXP-${Date.now().toString().slice(-6)}`;
    const [batchExpRes] = await pool.query(
      'INSERT INTO medicinebatch (medicine_id, batch_number, quantity, unit_price, expiry_date) VALUES (?, ?, 20, 5.00, "2020-01-01")',
      [testMedicineId, batchExpNumber]
    );
    testBatchExpId = batchExpRes.insertId;

    console.log(`✓ Provisioned test medicine ID: ${testMedicineId}`);
    console.log(`✓ Provisioned test batch A (ID: ${testBatchAId}, 100 units @ 12.50)`);
    console.log(`✓ Provisioned test batch B (ID: ${testBatchBId}, 50 units @ 20.00)`);
    console.log(`✓ Provisioned test batch Expired (ID: ${testBatchExpId}, 20 units expired)`);

    // -----------------------------------------------------------------
    // TEST 1: GET /api/sales - View Sales Ledger
    // -----------------------------------------------------------------
    console.log('\n--- 1. Testing GET /api/sales: Sales History Ledger ---');
    const getRes = await request('GET', '/api/sales');
    assert(getRes.status === 200, 'GET /api/sales returns 200 OK');
    assert(getRes.body.success === true, 'Response body has success: true');
    assert(Array.isArray(getRes.body.data), 'Sales data is an array');
    assert(getRes.body.data.length >= 3, `Returned ${getRes.body.data.length} sales (includes pre-existing records)`);
    
    const firstSale = getRes.body.data[0];
    assert(Boolean(firstSale.invoiceNumber), 'Sale record includes formatted invoice number');
    assert(typeof firstSale.totalAmount === 'number', 'Total amount is formatted as a numeric value');
    assert(firstSale.patientName !== undefined, 'Includes patient / customer name');

    // -----------------------------------------------------------------
    // TEST 2: GET /api/sales/patients - Patient Helper Endpoint
    // -----------------------------------------------------------------
    console.log('\n--- 2. Testing GET /api/sales/patients: Customer Registry ---');
    const patRes = await request('GET', '/api/sales/patients');
    assert(patRes.status === 200, 'GET /api/sales/patients returns 200 OK');
    assert(patRes.body.success === true, 'Patients response has success: true');
    assert(patRes.body.data.length >= 3, 'Returns registered patients from MySQL');

    // -----------------------------------------------------------------
    // TEST 3: GET /api/sales/:id - Retrieve Specific Sale Details
    // -----------------------------------------------------------------
    console.log('\n--- 3. Testing GET /api/sales/1: Single Sale with Line Items ---');
    const sale1Res = await request('GET', '/api/sales/1');
    assert(sale1Res.status === 200, 'GET /api/sales/1 returns 200 OK');
    assert(sale1Res.body.success === true, 'Response body has success: true');
    assert(sale1Res.body.data.id === 1, 'Sale ID matches requested ID');
    assert(Array.isArray(sale1Res.body.data.items), 'Sale includes items array');
    assert(sale1Res.body.data.items.length === 2, 'Sale 1 has 2 line items');
    assert(sale1Res.body.data.items[0].batchNumber === 'PAR101', 'Line item includes joined batch number');
    assert(sale1Res.body.data.items[0].medicineName === 'Paracetamol', 'Line item includes joined medicine name');

    // -----------------------------------------------------------------
    // TEST 4: GET /api/sales/:id - Non-existent & Invalid Sale IDs
    // -----------------------------------------------------------------
    console.log('\n--- 4. Testing GET /api/sales/:id 404 & 400 Validation ---');
    const notFoundRes = await request('GET', '/api/sales/999999');
    assert(notFoundRes.status === 404, 'Returns 404 for non-existent sale ID');
    assert(notFoundRes.body.success === false, 'Returns success: false');

    const badIdRes = await request('GET', '/api/sales/abc');
    assert(badIdRes.status === 400, 'Returns 400 for non-numeric sale ID');

    // -----------------------------------------------------------------
    // TEST 5: POST /api/sales - Validation: Empty Items
    // -----------------------------------------------------------------
    console.log('\n--- 5. Testing POST /api/sales Validation: Missing Items ---');
    const noItemsRes = await request('POST', '/api/sales', { patientId: 1, items: [] });
    assert(noItemsRes.status === 400, 'Rejects empty items array with 400 Bad Request');
    assert(noItemsRes.body.success === false, 'Returns success: false');

    // -----------------------------------------------------------------
    // TEST 6: POST /api/sales - Validation: Invalid Quantity
    // -----------------------------------------------------------------
    console.log('\n--- 6. Testing POST /api/sales Validation: Invalid Quantity ---');
    const zeroQtyRes = await request('POST', '/api/sales', {
      patientId: 1,
      items: [{ batchId: testBatchAId, quantity: 0 }]
    });
    assert(zeroQtyRes.status === 400, 'Rejects quantity <= 0 with 400 Bad Request');

    const negQtyRes = await request('POST', '/api/sales', {
      patientId: 1,
      items: [{ batchId: testBatchAId, quantity: -5 }]
    });
    assert(negQtyRes.status === 400, 'Rejects negative quantity with 400 Bad Request');

    // -----------------------------------------------------------------
    // TEST 7: POST /api/sales - Validation: Non-existent Batch ID
    // -----------------------------------------------------------------
    console.log('\n--- 7. Testing POST /api/sales Validation: Non-existent Batch ---');
    const badBatchRes = await request('POST', '/api/sales', {
      patientId: 1,
      items: [{ batchId: 999999, quantity: 2 }]
    });
    assert(badBatchRes.status === 404, 'Rejects non-existent batch ID with 404 Not Found');
    assert(badBatchRes.body.error.includes('does not exist'), 'Error states batch does not exist');

    // -----------------------------------------------------------------
    // TEST 8: POST /api/sales - Clinical Safety: Expired Batch Rejection
    // -----------------------------------------------------------------
    console.log('\n--- 8. Testing POST /api/sales Clinical Safety: Expired Batch ---');
    const expiredSaleRes = await request('POST', '/api/sales', {
      patientId: 1,
      items: [{ batchId: testBatchExpId, quantity: 1 }]
    });
    assert(expiredSaleRes.status === 400, 'Rejects dispensing expired medication with 400 Bad Request');
    assert(expiredSaleRes.body.error.includes('EXPIRED'), 'Error indicates batch is expired');

    // -----------------------------------------------------------------
    // TEST 9: POST /api/sales - Stock Sufficiency: Exceeding Available Stock
    // -----------------------------------------------------------------
    console.log('\n--- 9. Testing POST /api/sales Stock Sufficiency: Oversell Rejection ---');
    const oversellRes = await request('POST', '/api/sales', {
      patientId: 1,
      items: [{ batchId: testBatchAId, quantity: 9999 }]
    });
    assert(oversellRes.status === 409, 'Rejects overselling with 409 Conflict');
    assert(oversellRes.body.error.includes('Insufficient stock'), 'Error specifies Insufficient stock');

    // -----------------------------------------------------------------
    // TEST 10: POST /api/sales - Create Valid Single-Item Sale & Verify Stock Deduction & Total
    // -----------------------------------------------------------------
    console.log('\n--- 10. Testing Valid Single-Item Sale (Stock Deduction & Bill Total) ---');
    // Initial stock: 100 units @ 12.50
    // Buy 4 units: Expected Total = 4 * 12.50 = 50.00, Remaining Stock = 96
    const salePostRes = await request('POST', '/api/sales', {
      patientId: 1,
      items: [{ batchId: testBatchAId, quantity: 4 }]
    });
    assert(salePostRes.status === 201, 'Creates sale with 201 Created');
    assert(salePostRes.body.success === true, 'Response has success: true');
    const createdSaleId = salePostRes.body.data.saleId;
    createdSaleIds.push(createdSaleId);
    assert(salePostRes.body.data.totalAmount === 50.00, 'Returned bill total matches trusted calculation (50.00)');

    // Verify MedicineBatch stock in MySQL
    const [[batchACheck]] = await pool.query('SELECT quantity FROM medicinebatch WHERE batch_id = ?', [testBatchAId]);
    assert(batchACheck.quantity === 96, `Stock in MySQL was accurately deducted to 96 (was 100, deducted 4). NO DOUBLE DEDUCTION.`);

    // Verify Sale record in MySQL
    const [[saleCheck]] = await pool.query('SELECT total_amount FROM sale WHERE sale_id = ?', [createdSaleId]);
    assert(parseFloat(saleCheck.total_amount) === 50.00, `Sale total_amount in MySQL is 50.00. NO DOUBLE COUNTING.`);

    // -----------------------------------------------------------------
    // TEST 11: POST /api/sales - Create Valid Multi-Item Sale
    // -----------------------------------------------------------------
    console.log('\n--- 11. Testing Valid Multi-Item Sale ---');
    // Batch A: 96 stock, buy 2 @ 12.50 = 25.00
    // Batch B: 50 stock, buy 3 @ 20.00 = 60.00
    // Total = 85.00
    const multiSaleRes = await request('POST', '/api/sales', {
      patientId: 2,
      items: [
        { batchId: testBatchAId, quantity: 2 },
        { batchId: testBatchBId, quantity: 3 }
      ]
    });
    assert(multiSaleRes.status === 201, 'Creates multi-item sale with 201 Created');
    assert(multiSaleRes.body.data.totalAmount === 85.00, 'Multi-item total is exactly 85.00 (25.00 + 60.00)');
    const multiSaleId = multiSaleRes.body.data.saleId;
    createdSaleIds.push(multiSaleId);

    // Verify stock deductions for both batches
    const [[batchAAfterMulti]] = await pool.query('SELECT quantity FROM medicinebatch WHERE batch_id = ?', [testBatchAId]);
    const [[batchBAfterMulti]] = await pool.query('SELECT quantity FROM medicinebatch WHERE batch_id = ?', [testBatchBId]);
    assert(batchAAfterMulti.quantity === 94, 'Batch A stock deducted from 96 to 94 (-2)');
    assert(batchBAfterMulti.quantity === 47, 'Batch B stock deducted from 50 to 47 (-3)');

    // Verify GET /api/sales/:id for this multi-item sale
    const getMultiRes = await request('GET', `/api/sales/${multiSaleId}`);
    assert(getMultiRes.status === 200, 'GET /api/sales/:id returns 200 for new multi-item sale');
    assert(getMultiRes.body.data.itemsCount === 2, 'Returns 2 line items');
    assert(getMultiRes.body.data.totalAmount === 85.00, 'Fetched sale total matches 85.00');

    // -----------------------------------------------------------------
    // TEST 12: POST /api/sales - Transaction Rollback on Partial Multi-Item Failure
    // -----------------------------------------------------------------
    console.log('\n--- 12. Testing Transaction Rollback on Multi-Item Failure ---');
    // Item 1: Valid (5 units of Batch B, stock is 47)
    // Item 2: Invalid (9999 units of Batch A, stock is 94 -> triggers failure)
    const stockABeforeRollback = batchAAfterMulti.quantity;
    const stockBBeforeRollback = batchBAfterMulti.quantity;

    const failedTxRes = await request('POST', '/api/sales', {
      patientId: 1,
      items: [
        { batchId: testBatchBId, quantity: 5 },
        { batchId: testBatchAId, quantity: 9999 }
      ]
    });
    assert(failedTxRes.status === 409, 'Rejects failing multi-item transaction with 409 Conflict');

    // Verify atomicity: Item 1 must NOT have deducted stock!
    const [[stockBAfterRollback]] = await pool.query('SELECT quantity FROM medicinebatch WHERE batch_id = ?', [testBatchBId]);
    const [[stockAAfterRollback]] = await pool.query('SELECT quantity FROM medicinebatch WHERE batch_id = ?', [testBatchAId]);
    assert(stockBAfterRollback.quantity === stockBBeforeRollback, `Batch B stock cleanly preserved at ${stockBBeforeRollback} (atomic rollback confirmed)`);
    assert(stockAAfterRollback.quantity === stockABeforeRollback, `Batch A stock cleanly preserved at ${stockABeforeRollback}`);

    // Verify no ghost sale record was created
    const [orphanSales] = await pool.query(
      'SELECT sale_id FROM sale WHERE sale_id NOT IN (?, ?, ?, ?, ?)',
      [1, 2, 3, createdSaleId, multiSaleId]
    );
    assert(orphanSales.length === 0, 'No orphan or uncommitted sale rows exist in MySQL');

    // -----------------------------------------------------------------
    // TEST 13: Database Triggers & Business Data Integrity
    // -----------------------------------------------------------------
    console.log('\n--- 13. Verifying Stock Triggers Intact & Business Data Preserved ---');
    const [triggers] = await pool.query(
      'SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = "pharmacy_db"'
    );
    const trigNames = triggers.map(t => t.TRIGGER_NAME.toLowerCase());
    assert(trigNames.includes('check_sale_stock'), 'Trigger check_sale_stock is active in MySQL');
    assert(trigNames.includes('after_saleitem_insert'), 'Trigger after_saleitem_insert is active in MySQL');

    // Verify initial sales 1, 2, 3 remain intact
    const [origSales] = await pool.query('SELECT sale_id FROM sale WHERE sale_id IN (1, 2, 3)');
    assert(origSales.length === 3, 'Pre-existing business sales (1, 2, 3) are completely intact');

  } catch (err) {
    console.error('Unexpected test suite error:', err);
    testsFailed++;
  } finally {
    // -----------------------------------------------------------------
    // CLEANUP: Clean up only test records created during testing
    // -----------------------------------------------------------------
    console.log('\n--- Cleaning up test records ---');
    try {
      for (const sId of createdSaleIds) {
        await pool.query('DELETE FROM saleitem WHERE sale_id = ?', [sId]);
        await pool.query('DELETE FROM sale WHERE sale_id = ?', [sId]);
        console.log(`✓ Cleaned up test sale ID ${sId}`);
      }
      if (testBatchExpId) await pool.query('DELETE FROM medicinebatch WHERE batch_id = ?', [testBatchExpId]);
      if (testBatchBId) await pool.query('DELETE FROM medicinebatch WHERE batch_id = ?', [testBatchBId]);
      if (testBatchAId) await pool.query('DELETE FROM medicinebatch WHERE batch_id = ?', [testBatchAId]);
      if (testMedicineId) await pool.query('DELETE FROM medicine WHERE medicine_id = ?', [testMedicineId]);
      console.log('✓ Cleaned up test batches and test medicine');
    } catch (cleanupErr) {
      console.warn('Cleanup warning:', cleanupErr.message);
    }

    if (server) server.close();
    await pool.end();

    console.log('\n=============================================================');
    console.log(`🏁 Sales Test Summary: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('=============================================================');

    if (testsFailed > 0) {
      process.exit(1);
    }
  }
}

runSalesTests();
