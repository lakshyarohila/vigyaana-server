const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { addReview, getCourseReviews, deleteReview } = require('../controllers/reviewController');

router.post('/', protect, addReview); // ✅ Add Review
router.get('/:courseId', getCourseReviews); // ✅ Get Reviews for Course
router.delete('/:id', protect, deleteReview); // ✅ Delete Review

module.exports = router;
