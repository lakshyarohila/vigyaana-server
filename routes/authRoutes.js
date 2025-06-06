const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { getCurrentUser } = require('../controllers/authController');
const protect = require('../middleware/auth');
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);

const resetPassword = require('./reset-password');
router.use(resetPassword);










const prisma = require('../config/db');
const crypto = require('crypto');
const sendResetEmail = require('../utils/sendEmail');

// ⬇️ Add this inside auth.js
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  await prisma.passwordReset.create({
    data: {
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
      user: { connect: { id: user.id } },
    },
  });

  await sendResetEmail(email, token);
  return res.json({ message: 'Password reset link sent to email' });
});









module.exports = router;
