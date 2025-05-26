const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { isStudent } = require('../middleware/roles');
const {
  createOrder,
  verifyPayment,
} = require('../controllers/paymentController');

router.post('/order', protect, isStudent, createOrder);
router.post('/verify', protect, isStudent, verifyPayment);

module.exports = router;
