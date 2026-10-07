const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { pool } = require('../config/db');

/**
 * Verify JWT token from Authorization header (Bearer <token>)
 */
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid or forged authentication token.'
      });
    }

    // Attach decoded user
    req.user = {
      user_id: decoded.user_id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication verification failure',
      error: error.message
    });
  }
}

/**
 * Role-Based Access Control middleware
 * @param  {...string} roles - Permitted roles ('citizen', 'volunteer', 'admin')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Requires one of [${roles.join(', ')}] role.`
      });
    }

    next();
  };
}

/**
 * Optional token middleware: parses token if present, does not fail if missing
 */
function optionalToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
  } catch (e) {
    // Ignore invalid optional token
  }
  next();
}

module.exports = {
  verifyToken,
  requireRole,
  optionalToken
};
