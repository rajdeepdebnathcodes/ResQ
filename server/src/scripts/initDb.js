const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config/env');

async function initDatabase() {
  console.log('[ResQ Database Initializer] Connecting to MySQL host...');
  console.log(`[Host]: ${config.DB_HOST}:${config.DB_PORT} as User: ${config.DB_USER}`);

  let connection;
  try {
    // Connect without specifying database first
    connection = await mysql.createConnection({
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('[ResQ Database Initializer] Connected to MySQL. Reading schema.sql...');

    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[ResQ Database Initializer] Applying schema DDL...');
    await connection.query(schemaSql);

    console.log('✅ [Success] Database "resq_db" and all 9 tables initialized successfully!');
  } catch (error) {
    console.error('❌ [Database Initializer Error]:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 Please check your DB_USER and DB_PASSWORD in server/.env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('👉 Please ensure your MySQL server service is running on your machine.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
