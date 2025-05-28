const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { isStudent } = require('../middleware/roles');
const {
  enrollInCourse,
  getMyEnrolledCourses,
  getEnrolledCourseSections,checkEnrollment
} = require('../controllers/enrollmentController');
const { updateProgress } = require('../controllers/enrollmentController');
router.post('/', protect, isStudent, enrollInCourse);
router.get('/my', protect, isStudent, getMyEnrolledCourses);
router.get('/sections/:courseId', protect, isStudent, getEnrolledCourseSections);
router.patch('/progress/:courseId', protect, isStudent, updateProgress);
router.get('/check/:courseId', protect, isStudent, checkEnrollment);
module.exports = router;
