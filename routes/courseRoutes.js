const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { isInstructor, isAdmin } = require('../middleware/roles');
const upload = require('../config/multer');

const {
  createCourse,
  getCourseById, // ✅ Added this missing route
  getAllPublishedCourses,
  getMyCourses,
  updateCourseStatus,
  deleteCourse,
} = require('../controllers/courseController');

// ✅ Keep your existing middleware
const allowAdminOrInstructor = (req, res, next) => {
  if (req.user.role === 'INSTRUCTOR' || req.user.role === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
};

// ✅ Course CRUD routes with your existing middleware
router.get('/', getAllPublishedCourses);
router.get('/mine', protect, getMyCourses);
router.get('/:id', protect, getCourseById); // ✅ This was missing!
router.post('/', protect, isInstructor, upload.single('thumbnail'), createCourse);
router.patch('/:id/status', protect, allowAdminOrInstructor, updateCourseStatus);
router.delete('/:id', protect, isInstructor, deleteCourse);

module.exports = router;