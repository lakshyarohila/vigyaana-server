const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendResetEmail = require("../utils/sendEmail");
const protect = require("../middleware/auth");
const { OAuth2Client } = require('google-auth-library');
const { register, login, logout, getCurrentUser } = require("../controllers/authController");
require('dotenv').config();

console.log(process.env.API_KEY); // Access environment variables
// Basic email/password auth
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getCurrentUser);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.passwordReset.create({
    data: {
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      user: { connect: { id: user.id } },
    },
  });

  await sendResetEmail(email, token);
  return res.json({ message: "Password reset link sent to email" });
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and password required" });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    });

    await prisma.passwordReset.delete({
      where: { id: resetRecord.id },
    });

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ New: Manual Google Login (token sent from frontend)
router.post('/google-login', async (req, res) => {
  const { credential } = req.body; // frontend sends the Google JWT token
  
  console.log('Received request body:', req.body); // Debug log
  
  if (!credential) {
    console.error('Missing Google credential in request');
    return res.status(400).json({ message: 'Missing Google credential' });
  }

  try {
    // Verify the Google JWT token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID, // Make sure this matches your frontend client ID
    });

    const payload = ticket.getPayload();
    console.log('Google token payload:', payload); // Debug log
    
    const { email, name, picture, email_verified } = payload;

    if (!email || !name) {
      return res.status(400).json({ message: 'Invalid Google token - missing email or name' });
    }

    // Optional: Check if email is verified
    if (!email_verified) {
      return res.status(400).json({ message: 'Google email not verified' });
    }

    // Check or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: '', // blank password for Google users
          role: 'STUDENT', // or default role
          // Optional: store profile picture
          // profileImage: picture,
        },
      });
      console.log('Created new user:', user.id);
    } else {
      console.log('Found existing user:', user.id);
    }

    // Create your backend's JWT
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Set cookie (same as your normal login)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      message: 'Google login successful',
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Google login error:', err);
    
    // More specific error handling
    if (err.message && err.message.includes('Token used too early')) {
      return res.status(401).json({ message: 'Google token used too early' });
    }
    if (err.message && err.message.includes('Token used too late')) {
      return res.status(401).json({ message: 'Google token expired' });
    }
    if (err.message && err.message.includes('Invalid token signature')) {
      return res.status(401).json({ message: 'Invalid Google token signature' });
    }
    
    return res.status(401).json({ 
      message: 'Google token verification failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
