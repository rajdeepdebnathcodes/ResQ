const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Helper function to test DB connection gracefully
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Connected successfully to MySQL database "${config.DB_NAME}" on ${config.DB_HOST}:${config.DB_PORT}`);
    connection.release();
    return true;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MySQL at ${config.DB_HOST}:${config.DB_PORT}. Reason: ${error.message}`);
    console.warn(`[Database Warning] Please ensure MySQL is running and credentials in server/.env are set.`);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
