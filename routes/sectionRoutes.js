const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { isInstructor } = require('../middleware/roles');
const upload = require('../config/multer');
const {
  addSection,
  getCourseSections,
} = require('../controllers/sectionController');

router.post('/', protect, isInstructor, upload.single('video'), addSection);
router.get('/:courseId', getCourseSections);

module.exports = router;
