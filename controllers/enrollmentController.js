const prisma = require('../config/db');

exports.enrollInCourse = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  try {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.status !== 'PUBLISHED') {
      return res.status(404).json({ message: 'Course not available' });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (err) {
    console.error('Enroll error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyEnrolledCourses = async (req, res) => {
  try {
    const courses = await prisma.enrollment.findMany({
      where: { userId: req.user.id },
      include: {
        course: {
          include: {
            createdBy: { select: { id: true, name: true } },
            _count: { select: { sections: true } },
          },
        },
      },
    });

    res.json(courses);
  } catch (err) {
    console.error('Get enrolled error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEnrolledCourseSections = async (req, res) => {
  const { courseId } = req.params;

  try {
    // Check if enrolled
    const enrolled = await prisma.enrollment.findFirst({
      where: {
        userId: req.user.id,
        courseId,
      },
    });

    if (!enrolled) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    const sections = await prisma.section.findMany({
      where: { courseId },
    });

    res.json({ sections });
  } catch (err) {
    console.error('Fetch sections error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProgress = async (req, res) => {
  const { courseId } = req.params;
  const { progress } = req.body;
  const userId = req.user.id;

  try {
    // Ensure user is enrolled
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId },
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Cap progress to 100
    const clampedProgress = Math.min(progress, 100);

    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: clampedProgress,
        completed: clampedProgress === 100,
      },
    });

    // Auto-issue certificate on 100%
    if (clampedProgress === 100) {
      const existingCert = await prisma.certificate.findFirst({
        where: {
          userId,
          courseId,
        },
      });

      if (!existingCert) {
        await prisma.certificate.create({
          data: {
            userId,
            courseId,
          },
        });
      }
    }

    res.json({ message: 'Progress updated', progress: clampedProgress });
  } catch (err) {
    console.error('Update progress error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
