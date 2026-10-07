const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Volunteer updates availability
router.patch('/volunteer/status', verifyToken, requireRole('volunteer'), userController.updateVolunteerStatus);

// Admin user management
router.get('/', verifyToken, requireRole('admin'), userController.getAllUsers);
router.patch('/:id/role', verifyToken, requireRole('admin'), userController.updateUserRole);
router.delete('/:id', verifyToken, requireRole('admin'), userController.deleteUser);

module.exports = router;
