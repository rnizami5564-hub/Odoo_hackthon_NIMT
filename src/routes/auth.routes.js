const express = require('express');
const { signUp, signIn } = require('../controllers/auth.controller');
const { authenticateToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);

router.get('/admin-check', authenticateToken, requireRole('Admin'), (req, res) => {
  res.status(200).json({ message: 'Admin access granted' });
});

module.exports = router;
