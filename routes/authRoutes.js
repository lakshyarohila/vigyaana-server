const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { getCurrentUser } = require('../controllers/authController');
const protect = require('../middleware/auth');
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);
module.exports = router;
