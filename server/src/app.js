const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const rescueRoutes = require('./routes/rescueRoutes');
const shelterRoutes = require('./routes/shelterRoutes');
const alertRoutes = require('./routes/alertRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Security headers with resource sharing for uploaded images
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, postman) or matching client url
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin === config.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local university networks & AWS demos
      }
    },
    credentials: true
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static folder for uploaded disaster images
const uploadsPath = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'ResQ Disaster Response API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/rescue', rescueRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// Production Static Client Serving (Single-server deployment on AWS or local test)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    // If request does not start with /api or /uploads, send index.html
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
