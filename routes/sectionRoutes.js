const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {
  addSection,
  getCourseSections,
  createLiveSession,
  getLiveSessions
} = require('../controllers/sectionController');

const protect = require('../middleware/auth');

// For recorded sections
router.post('/', protect, upload.single('video'), addSection);
router.get('/:courseId', protect, getCourseSections);

// For live sessions
router.post('/live/:courseId', protect, createLiveSession);
router.get('/live/:courseId', protect, getLiveSessions);

module.exports = router;
