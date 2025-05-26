const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { isInstructor, isAdmin } = require('../middleware/roles');
const upload = require('../config/multer');

const {
  createCourse,
  getAllPublishedCourses,
  getMyCourses,
  updateCourseStatus,
  deleteCourse,
} = require('../controllers/courseController');

router.get('/', getAllPublishedCourses);
router.get('/mine', protect, getMyCourses);
router.post('/', protect, isInstructor, upload.single('thumbnail'), createCourse);
router.patch('/:id/status', protect, isInstructor, updateCourseStatus);
router.delete('/:id', protect, isInstructor, deleteCourse);

module.exports = router;
