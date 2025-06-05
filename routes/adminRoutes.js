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

// GET monthly revenue (admin-only)



router.get('/stats', protect, isAdmin, async (req, res) => {
  try {
    const [users, courses, enrollments, reviews, payments] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.review.count(),
      prisma.payment.findMany({ where: { status: 'success' } })
    ]);

    const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
      users,
      courses,
      enrollments,
      reviews,
      revenue
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
});

router.get('/stats/revenue', protect, isAdmin, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        status: {
          equals: 'success',      // match your real status value
          mode: 'insensitive',    // allows SUCCESS, Success, success, etc.
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    const revenueMap = {};

    payments.forEach((payment) => {
      const date = new Date(payment.createdAt);
      const month = date.toLocaleString('default', { month: 'short' }); // Jan, Feb...
      const year = date.getFullYear();
      const key = `${month}-${year}`;

      if (!revenueMap[key]) {
        revenueMap[key] = 0;
      }
      revenueMap[key] += payment.amount;
    });

    const revenueData = Object.entries(revenueMap)
      .map(([label, totalRevenue]) => ({
        label,
        totalRevenue,
      }))
      .sort((a, b) => new Date(`1 ${a.label}`) - new Date(`1 ${b.label}`));

    res.json(revenueData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



// GET monthly new users count (admin-only)
router.get('/stats/users', protect, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        createdAt: true,
      },
    });

    const userMap = {};

    users.forEach((user) => {
      const date = new Date(user.createdAt);
      const month = date.toLocaleString('default', { month: 'short' }); // Jan, Feb, etc.
      const year = date.getFullYear();
      const key = `${month}-${year}`;

      if (!userMap[key]) {
        userMap[key] = 0;
      }
      userMap[key] += 1;
    });

    const userData = Object.entries(userMap).map(([label, totalUsers]) => ({
      label,
      totalUsers,
    })).sort((a, b) => new Date(`1 ${a.label}`) - new Date(`1 ${b.label}`));

    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET top 5 most enrolled courses (admin-only)
router.get('/stats/popular-courses', protect, isAdmin, async (req, res) => {
  try {
    const popularCourses = await prisma.course.findMany({
      where: {
        enrollments: {
          some: {}, // ensures course has enrollments
        },
      },
      select: {
        title: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: {
        enrollments: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    const result = popularCourses.map(course => ({
      title: course.title,
      enrollments: course._count.enrollments,
    }));

    res.json(result);
  } catch (err) {
    console.error('Popular courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = router