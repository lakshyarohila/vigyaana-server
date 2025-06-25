const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { createLiveSession, getLiveSessionsByCourse } = require('../controllers/liveSessionController');

// ✅ Live session routes
router.post('/', protect, createLiveSession); // POST /api/livesessions
router.get('/course/:courseId', protect, getLiveSessionsByCourse); // GET /api/livesessions/course/:courseId

module.exports = router;