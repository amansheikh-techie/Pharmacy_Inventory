// =====================================================================
// Phase 3B: Reusable MySQL Database Inspection & Verification Script
// Run via: node backend/test_db_connection.js
// =====================================================================

const { pool, testConnection } = require('./db');

async function inspectDatabase() {
  console.log(`\n=============================================================`);
  console.log(`🔍 Phase 3B: MySQL Connection & Schema Inspection`);
  console.log(`=============================================================`);

  // Step 1: Basic connection test & current database check
  const connTest = await testConnection();

  if (!connTest.success) {
    console.error(`❌ Connection Failed: ${connTest.error}`);
    console.error(`💡 Troubleshooting: ${connTest.troubleshooting}`);
    await pool.end();
    return;
  }

  console.log(`✓ Connection Status: CONNECTED`);
  console.log(`✓ Active Database:   ${connTest.database}`);
  console.log(`✓ Host / User:       ${connTest.host} / ${connTest.user}`);
  console.log(`-------------------------------------------------------------`);

  let connection;
  try {
    connection = await pool.getConnection();

    // Step 2: Verify Selected Database
    const [dbResult] = await connection.query('SELECT DATABASE() AS active_db, VERSION() AS mysql_version;');
    console.log(`✓ Active DB Check:   ${dbResult[0].active_db}`);
    console.log(`✓ MySQL Version:     ${dbResult[0].mysql_version}`);
    console.log(`-------------------------------------------------------------`);

    // Step 3: Inspect Existing Tables (Read-Only)
    console.log(`📋 Inspecting Tables in "${dbResult[0].active_db}":`);
    const [tables] = await connection.query(`
      SELECT 
        TABLE_NAME AS tableName,
        TABLE_ROWS AS approxRows,
        CREATE_TIME AS createdAt
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME ASC;
    `, [dbResult[0].active_db]);

    if (tables.length === 0) {
      console.log(`⚠️ No tables found in "${dbResult[0].active_db}". Please run database/schema.sql to create tables.`);
    } else {
      console.log(`Found ${tables.length} table(s):`);
      tables.forEach((t, i) => {
        console.log(`  ${i + 1}. [${t.tableName}] (~${t.approxRows || 0} rows)`);
      });
    }

    // Step 4: Inspect Existing Triggers
    console.log(`-------------------------------------------------------------`);
    console.log(`⚡ Inspecting Triggers:`);
    const [triggers] = await connection.query(`
      SELECT 
        TRIGGER_NAME AS triggerName,
        EVENT_MANIPULATION AS event,
        EVENT_OBJECT_TABLE AS tableName,
        ACTION_TIMING AS timing
      FROM information_schema.TRIGGERS
      WHERE TRIGGER_SCHEMA = ?;
    `, [dbResult[0].active_db]);

    if (triggers.length === 0) {
      console.log(`  (No custom triggers registered currently)`);
    } else {
      triggers.forEach((tr, i) => {
        console.log(`  ${i + 1}. ${tr.triggerName} (${tr.timing} ${tr.event} ON ${tr.tableName})`);
      });
    }

    // Step 5: Inspect Existing Stored Procedures
    console.log(`-------------------------------------------------------------`);
    console.log(`📦 Inspecting Stored Procedures:`);
    const [routines] = await connection.query(`
      SELECT 
        ROUTINE_NAME AS routineName,
        ROUTINE_TYPE AS routineType
      FROM information_schema.ROUTINES
      WHERE ROUTINE_SCHEMA = ?;
    `, [dbResult[0].active_db]);

    if (routines.length === 0) {
      console.log(`  (No stored procedures registered currently)`);
    } else {
      routines.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.routineName} (${r.routineType})`);
      });
    }

    console.log(`=============================================================`);
    console.log(`✓ Phase 3B Inspection Completed Successfully!`);
    console.log(`=============================================================\n`);

  } catch (err) {
    console.error(`⚠️ Error during schema inspection:`, err.message);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

// Execute when invoked directly
if (require.main === module) {
  inspectDatabase();
}

module.exports = { inspectDatabase };
