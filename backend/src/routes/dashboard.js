const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole(['superadmin']));

router.get('/stats', dashboardController.getStats);
router.get('/statistics', dashboardController.getStatistics);
router.get('/logs', dashboardController.getLogs);
router.post('/check-expired', dashboardController.checkExpiredMembers);

module.exports = router;
