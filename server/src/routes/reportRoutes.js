const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create report (Citizen, Volunteer, Admin) with optional image upload
router.post('/', verifyToken, upload.single('image'), reportController.createReport);

// Citizen's personal reports
router.get('/my-reports', verifyToken, reportController.getMyReports);

// Get all reports (Public/Authenticated)
router.get('/', reportController.getAllReports);

// Single report details
router.get('/:id', reportController.getReportById);

// Update status (Admin or Volunteer)
router.patch('/:id/status', verifyToken, requireRole('admin', 'volunteer'), reportController.updateReportStatus);

// Delete report (Admin)
router.delete('/:id', verifyToken, requireRole('admin'), reportController.deleteReport);

module.exports = router;
