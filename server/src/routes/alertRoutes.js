const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Public active alerts
router.get('/active', alertController.getActiveAlerts);

// Admin all alerts
router.get('/', verifyToken, requireRole('admin'), alertController.getAllAlerts);

// Admin create, update, delete
router.post('/', verifyToken, requireRole('admin'), alertController.createAlert);
router.put('/:id', verifyToken, requireRole('admin'), alertController.updateAlert);
router.delete('/:id', verifyToken, requireRole('admin'), alertController.deleteAlert);

module.exports = router;
