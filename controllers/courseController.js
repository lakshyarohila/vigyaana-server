const prisma = require('../config/db');
const cloudinary = require('../config/cloudinary');

exports.createCourse = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'Thumbnail is required' });

    const upload = await cloudinary.uploader.upload(file.path, {
      folder: 'vigyana/courses',
    });

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        thumbnailUrl: upload.secure_url,
        createdById: req.user.id,
      },
    });

    res.status(201).json({ message: 'Course created', course });
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllPublishedCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' }, // 👈 critical!
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { sections: true, enrollments: true } },
      },
    });

    res.json(courses);
  } catch (err) {
    console.error('Fetch courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { createdById: req.user.id },
    });

    res.json(courses);
  } catch (err) {
    console.error('Fetch my courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCourseStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const updated = await prisma.course.update({
      where: { id },
      data: { status },
    });

    res.json({ message: 'Status updated', course: updated });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course || course.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.course.delete({ where: { id } });

    res.json({ message: 'Course deleted' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
