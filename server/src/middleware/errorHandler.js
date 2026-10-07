const config = require('../config/env');

function errorHandler(err, req, res, next) {
  console.error('[Server Error Handler]:', err);

  // Handle Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File size exceeds the limit of ${config.MAX_FILE_SIZE_MB}MB.`
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  // Handle explicit validation/format error
  if (err.message && err.message.includes('Invalid file format')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  };

  if (config.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

module.exports = errorHandler;
