const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config/env');

async function seedDatabase() {
  console.log('[ResQ Database Seeder] Connecting to MySQL database...');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      multipleStatements: true
    });

    console.log('[ResQ Database Seeder] Reading seed.sql...');

    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file not found at ${seedPath}`);
    }

    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('[ResQ Database Seeder] Injecting realistic demo accounts and disaster reports...');
    await connection.query(seedSql);

    console.log('✅ [Success] Realistic demo data seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('Default Demo Accounts:');
    console.log('1. Citizen:       citizen@resq.org       / Citizen@123');
    console.log('2. Volunteer:     volunteer@resq.org     / Volunteer@123');
    console.log('3. Administrator: admin@resq.org         / Admin@123');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ [Database Seeder Error]:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
