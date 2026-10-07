const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env if present, otherwise root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
  DB_NAME: process.env.DB_NAME || 'resq_db',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'resq_emergency_response_jwt_secret_key_2026_xyz',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Gemini AI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',

  // File Upload
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5,
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads'
};

module.exports = config;
