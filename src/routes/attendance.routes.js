const express = require('express');
const { checkIn, checkOut } = require('../controllers/attendance.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/check-in', authenticateToken, checkIn);
router.put('/check-out', authenticateToken, checkOut);

module.exports = router;
