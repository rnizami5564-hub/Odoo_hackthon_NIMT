const express = require('express');
const { submitLeave, getPendingLeaves, decideLeave } = require('../controllers/leave.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticateToken, submitLeave);
router.get('/pending', authenticateToken, requireRole('Admin'), getPendingLeaves);
router.put('/:id/approve', authenticateToken, requireRole('Admin'), decideLeave);

module.exports = router;
