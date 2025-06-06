const express = require('express');
const sendResetEmail = require('../utils/sendEmail');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { getCurrentUser } = require('../controllers/authController');
const protect = require('../middleware/auth');
const prisma = require('../config/db');
const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const sendResetEmail = require('../utils/sendEmail');
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);







router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and password required' });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    });

    await prisma.passwordReset.delete({
      where: { id: resetRecord.id },
    });

    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});








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
