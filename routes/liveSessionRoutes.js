const express = require('express');
const { createLiveSession } = require('../controllers/liveSessionController');
const protect = require('../middleware/auth'); // Ensure instructor is logged in

const router = express.Router();

router.post('/', protect, createLiveSession); // POST /api/live-sessions

module.exports = router;
