const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Aggregated analytics data (Public / Dashboard view)
router.get('/', analyticsController.getDashboardAnalytics);

module.exports = router;
