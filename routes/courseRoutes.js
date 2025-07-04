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
  deleteCourse,updateWhatsAppLink
} = require('../controllers/courseController');

router.get('/', getAllPublishedCourses);
router.get('/mine', protect, getMyCourses);
router.post('/', protect, isInstructor, upload.single('thumbnail'), createCourse);





const allowAdminOrInstructor = (req, res, next) => {
  if (req.user.role === 'INSTRUCTOR' || req.user.role === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
};
router.patch('/:id/status', protect, allowAdminOrInstructor, updateCourseStatus);



router.patch('/:id/whatsapp-link', protect, isInstructor, updateWhatsAppLink);



router.delete('/:id', protect, isInstructor, deleteCourse);


module.exports = router;
