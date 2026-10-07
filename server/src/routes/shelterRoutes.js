const express = require('express');
const router = express.Router();
const shelterController = require('../controllers/shelterController');
const { verifyToken, requireRole, optionalToken } = require('../middleware/auth');

// Public listing
router.get('/', shelterController.getAllShelters);
router.get('/:id', shelterController.getShelterById);

// Admin operations
router.post('/', verifyToken, requireRole('admin'), shelterController.createShelter);
router.put('/:id', verifyToken, requireRole('admin'), shelterController.updateShelter);
router.delete('/:id', verifyToken, requireRole('admin'), shelterController.deleteShelter);

module.exports = router;
