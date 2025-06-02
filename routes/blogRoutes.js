const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const upload = require('../utils/multer');

const {
  createBlog,
  getAllBlogs,
  getBlogById,
  deleteBlog,
  updateBlog,
} = require('../controllers/blogController');

// Public
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

// Admin only
router.post('/', protect, isAdmin, upload.single('image'), createBlog);
router.patch('/:id', protect, isAdmin, upload.single('image'), updateBlog);
router.delete('/:id', protect, isAdmin, deleteBlog);

module.exports = router;
