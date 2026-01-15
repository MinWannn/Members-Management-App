const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', requireRole(['superadmin']), userController.getAllUsers);
router.get('/expiring', requireRole(['superadmin']), userController.getExpiringMembers);
router.get('/find-duplicates', requireRole(['superadmin']), userController.findDuplicates);
router.get('/:id', userController.getUserById);
router.get('/:id/history', requireRole(['superadmin']), userController.getUserHistory);
router.post('/', requireRole(['superadmin']), userController.createMember);
router.post('/merge', requireRole(['superadmin']), userController.mergeUsers);
router.post('/:id/approve', requireRole(['superadmin']), userController.approveUser);
router.post('/:id/deny', requireRole(['superadmin']), userController.denyUser);
router.put('/:id', requireRole(['superadmin']), userController.updateUser);
router.patch('/:id/role', requireRole(['superadmin']), userController.changeRole);
router.delete('/:id', requireRole(['superadmin']), userController.deleteUser);

module.exports = router;



