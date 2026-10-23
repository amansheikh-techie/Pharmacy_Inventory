// =====================================================================
// Phase 5A: Comprehensive Automated Test Suite for Dashboard & Reports
// Technology: Node.js + Express + mysql2/promise (pharmacy_db)
// Tests:
// 1. GET /api/reports/dashboard-summary (compares with raw MySQL counts)
// 2. GET /api/reports/low-stock (verifies GetLowStock stored procedure & threshold < 30)
// 3. GET /api/reports/expiry (verifies GetExpiryReport stored procedure & 90-day window)
// 4. GET /api/reports/sales-summary (verifies totals, AOV, and recent sales)
// 5. Verification against duplicate counting due to multi-table joins
// =====================================================================

const http = require('http');
const express = require('express');
const reportRoutes = require('./routes/reportRoutes');
const { pool } = require('./db');

const app = express();
app.use(express.json());
app.use('/api/reports', reportRoutes);

let server;
let baseUrl;

function request(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method: 'GET',
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
    req.end();
  });
}

async function runTests() {
  console.log('=====================================================================');
  console.log(' Phase 5A: Automated Dashboard & Reports Test Suite');
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

  try {
    // Start ephemeral test server on random port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`Test server running at ${baseUrl}\n`);
        resolve();
      });
    });

    // -----------------------------------------------------------------
    // TEST 1: Direct MySQL Ground-Truth Inspection
    // -----------------------------------------------------------------
    console.log('[TEST 1] Querying direct MySQL ground-truth values...');
    const [medCountRows] = await pool.query('SELECT COUNT(*) AS total FROM Medicine');
    const [stockRows] = await pool.query('SELECT COALESCE(SUM(quantity), 0) AS total_stock FROM MedicineBatch');
    const [lowStockRows] = await pool.query('SELECT COUNT(*) AS count FROM MedicineBatch WHERE quantity < 30');
    const [expiredRows] = await pool.query('SELECT COUNT(*) AS count FROM MedicineBatch WHERE expiry_date < CURDATE()');
    const [salesCountRows] = await pool.query('SELECT COUNT(*) AS count FROM Sale');
    const [salesAmountRows] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) AS total FROM Sale');

    const expectedMedicines = parseInt(medCountRows[0].total, 10);
    const expectedStock = parseInt(stockRows[0].total_stock, 10);
    const expectedLowStock = parseInt(lowStockRows[0].count, 10);
    const expectedExpired = parseInt(expiredRows[0].count, 10);
    const expectedSalesCount = parseInt(salesCountRows[0].count, 10);
    const expectedSalesTotal = parseFloat(salesAmountRows[0].total);

    console.log(`  Expected Medicines: ${expectedMedicines}`);
    console.log(`  Expected Stock: ${expectedStock}`);
    console.log(`  Expected Low Stock (<30): ${expectedLowStock}`);
    console.log(`  Expected Expired (<CURDATE()): ${expectedExpired}`);
    console.log(`  Expected Sales Count: ${expectedSalesCount}`);
    console.log(`  Expected Sales Total: ₹${expectedSalesTotal.toFixed(2)}\n`);

    assert(expectedMedicines > 0, `Database contains active medicines (${expectedMedicines})`);
    assert(expectedStock > 0, `Database contains available stock (${expectedStock} units)`);

    // -----------------------------------------------------------------
    // TEST 2: Dashboard Summary API Verification
    // -----------------------------------------------------------------
    console.log('\n[TEST 2] GET /api/reports/dashboard-summary');
    const dashRes = await request('/api/reports/dashboard-summary');
    assert(dashRes.status === 200, `API responds with status 200 (got ${dashRes.status})`);
    assert(dashRes.body && dashRes.body.success === true, 'Response payload has success: true');

    const summary = dashRes.body.data;
    assert(summary.totalMedicines === expectedMedicines, 
      `totalMedicines matches MySQL (${summary.totalMedicines} === ${expectedMedicines})`);
    assert(summary.totalStock === expectedStock, 
      `totalStock matches batch sum (${summary.totalStock} === ${expectedStock})`);
    assert(summary.lowStockBatches === expectedLowStock, 
      `lowStockBatches matches threshold < 30 (${summary.lowStockBatches} === ${expectedLowStock})`);
    assert(summary.expiredBatches === expectedExpired, 
      `expiredBatches matches expired count (${summary.expiredBatches} === ${expectedExpired})`);
    assert(summary.totalSales === expectedSalesCount, 
      `totalSales matches sales table count (${summary.totalSales} === ${expectedSalesCount})`);
    assert(parseFloat(summary.totalSalesAmount) === expectedSalesTotal, 
      `totalSalesAmount matches sum of total_amount (${summary.totalSalesAmount} === ${expectedSalesTotal})`);

    // -----------------------------------------------------------------
    // TEST 3: Duplicate Counting Invariant Check
    // -----------------------------------------------------------------
    console.log('\n[TEST 3] Invariant check: Duplicate counting detection');
    // Cartesian join test (what a bad query would return):
    const [badJoinRows] = await pool.query(`
      SELECT 
        COUNT(m.medicine_id) AS cartesian_meds,
        SUM(mb.quantity) AS cartesian_stock,
        COUNT(s.sale_id) AS cartesian_sales
      FROM Medicine m
      LEFT JOIN MedicineBatch mb ON m.medicine_id = mb.medicine_id
      LEFT JOIN Sale s ON 1=1
    `);
    const cartesianStock = parseInt(badJoinRows[0].cartesian_stock, 10);
    const cartesianSales = parseInt(badJoinRows[0].cartesian_sales, 10);

    assert(summary.totalStock !== cartesianStock || expectedSalesCount <= 1, 
      `totalStock avoids cartesian join duplication (actual: ${summary.totalStock}, cartesian: ${cartesianStock})`);
    assert(summary.totalSales !== cartesianSales || expectedStock <= 1, 
      `totalSales avoids cartesian join duplication (actual: ${summary.totalSales}, cartesian: ${cartesianSales})`);
    assert(summary.totalStock === expectedStock, 'totalStock is exactly non-duplicative');

    // -----------------------------------------------------------------
    // TEST 4: Low-Stock Report API (CALL GetLowStock())
    // -----------------------------------------------------------------
    console.log('\n[TEST 4] GET /api/reports/low-stock');
    const lowStockRes = await request('/api/reports/low-stock');
    assert(lowStockRes.status === 200, `API responds with status 200 (got ${lowStockRes.status})`);
    assert(lowStockRes.body && lowStockRes.body.success === true, 'Response payload has success: true');
    assert(lowStockRes.body.threshold === 30, 'Procedure threshold is verified at 30 units');
    assert(Array.isArray(lowStockRes.body.data), 'Returns data array');
    assert(lowStockRes.body.count === lowStockRes.body.data.length, 'Count matches returned data items');

    if (lowStockRes.body.data.length > 0) {
      const sample = lowStockRes.body.data[0];
      assert(sample.medicineName !== undefined, `Batch item has medicineName (${sample.medicineName})`);
      assert(sample.batchNumber !== undefined, `Batch item has batchNumber (${sample.batchNumber})`);
      assert(sample.stock < 30, `Batch stock is strictly less than 30 (${sample.stock} < 30)`);
    }

    // -----------------------------------------------------------------
    // TEST 5: Expiry Report API (CALL GetExpiryReport())
    // -----------------------------------------------------------------
    console.log('\n[TEST 5] GET /api/reports/expiry');
    const expiryRes = await request('/api/reports/expiry');
    assert(expiryRes.status === 200, `API responds with status 200 (got ${expiryRes.status})`);
    assert(expiryRes.body && expiryRes.body.success === true, 'Response payload has success: true');
    assert(expiryRes.body.source && expiryRes.body.source.includes('90-day'), 'Specifies 90-day procedure window');
    assert(Array.isArray(expiryRes.body.data), 'Returns data array');

    if (expiryRes.body.data.length > 0) {
      const sample = expiryRes.body.data[0];
      assert(sample.medicineName !== undefined, `Item has medicineName (${sample.medicineName})`);
      assert(sample.batchNumber !== undefined, `Item has batchNumber (${sample.batchNumber})`);
      assert(sample.expiryDate !== undefined, `Item has expiryDate (${sample.expiryDate})`);
      assert(sample.isExpired !== undefined, `Item has boolean isExpired classification (${sample.isExpired})`);
      assert(sample.statusLabel !== undefined, `Item has statusLabel (${sample.statusLabel})`);
    }

    // -----------------------------------------------------------------
    // TEST 6: Sales Summary & Audit Ledger API
    // -----------------------------------------------------------------
    console.log('\n[TEST 6] GET /api/reports/sales-summary');
    const salesRes = await request('/api/reports/sales-summary');
    assert(salesRes.status === 200, `API responds with status 200 (got ${salesRes.status})`);
    assert(salesRes.body && salesRes.body.success === true, 'Response payload has success: true');
    assert(salesRes.body.summary !== undefined, 'Summary object present');

    const salesSummary = salesRes.body.summary;
    assert(salesSummary.totalSales === expectedSalesCount, 
      `totalSales matches (${salesSummary.totalSales} === ${expectedSalesCount})`);
    assert(parseFloat(salesSummary.totalGrossSales) === expectedSalesTotal, 
      `totalGrossSales matches (${salesSummary.totalGrossSales} === ${expectedSalesTotal})`);

    const expectedAov = expectedSalesCount > 0 ? (expectedSalesTotal / expectedSalesCount) : 0;
    assert(Math.abs(salesSummary.averageSaleValue - expectedAov) < 0.01, 
      `averageSaleValue calculated correctly (${salesSummary.averageSaleValue.toFixed(2)} === ${expectedAov.toFixed(2)})`);

    assert(Array.isArray(salesRes.body.recentSales), 'recentSales array present');
    if (salesRes.body.recentSales.length > 0) {
      const s = salesRes.body.recentSales[0];
      assert(s.invoiceNumber !== undefined, `Sale item has invoiceNumber (${s.invoiceNumber})`);
      assert(s.date !== undefined, `Sale item has date (${s.date})`);
      assert(s.totalAmount !== undefined, `Sale item has totalAmount (₹${s.totalAmount})`);
      assert(s.itemCount !== undefined, `Sale item has itemCount (${s.itemCount})`);
    }

    console.log('\n=====================================================================');
    console.log(` Test Execution Completed: ${passed} PASSED, ${failed} FAILED`);
    console.log('=====================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }

  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await pool.end();
  }
}

runTests();
