const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/members-pdf', requireRole(['superadmin']), exportController.exportMembersPDF);
router.get('/user/:userId/history', exportController.exportUserHistory);

module.exports = router;
