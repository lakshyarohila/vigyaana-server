const prisma = require('../config/db');


exports.addReview = async (req, res) => {
  const { rating, comment, courseId } = req.body;
  const userId = req.user.id;

  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId },
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must enroll before reviewing.' });
    }

    const existing = await prisma.review.findFirst({
      where: { userId, courseId },
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this course.' });
    }

    const review = await prisma.review.create({
      data: { rating, comment, courseId, userId },
    });

    res.status(201).json(review);
  } catch (err) {
    console.error('Add Review Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { courseId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.deleteReview = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete' });
    }

    await prisma.review.delete({ where: { id } });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
