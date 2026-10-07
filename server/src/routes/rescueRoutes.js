const express = require('express');
const router = express.Router();
const rescueController = require('../controllers/rescueController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Citizen creates rescue request
router.post('/', verifyToken, rescueController.createRescueRequest);

// Volunteer pending requests queue
router.get('/pending', verifyToken, requireRole('volunteer', 'admin'), rescueController.getPendingRequests);

// Volunteer assigned requests
router.get('/my-assignments', verifyToken, requireRole('volunteer', 'admin'), rescueController.getMyAssignedRequests);

// All rescue requests (Admin, Volunteer)
router.get('/', verifyToken, rescueController.getAllRescueRequests);

// Single rescue request details & updates timeline
router.get('/:id', verifyToken, rescueController.getRescueDetails);

// Volunteer accepts request
router.post('/:id/accept', verifyToken, requireRole('volunteer', 'admin'), rescueController.acceptRescueRequest);

// Volunteer updates progress status with remarks
router.post('/:id/update-status', verifyToken, requireRole('volunteer', 'admin'), rescueController.updateRescueStatus);

module.exports = router;
