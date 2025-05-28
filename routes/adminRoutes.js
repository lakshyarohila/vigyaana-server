const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const prisma = require('../config/db');

// GET all courses (admin-only, all statuses)
router.get('/courses', protect, isAdmin, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { sections: true, enrollments: true } },
      },
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
