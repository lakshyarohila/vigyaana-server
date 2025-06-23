const prisma = require('../config/db');
const cloudinary = require('../config/cloudinary');

// ✅ Upload a recorded video section
exports.addSection = async (req, res) => {
  const { title, courseId } = req.body;
  const file = req.file;

  try {
    if (!file) return res.status(400).json({ message: 'Video is required' });

    const upload = await cloudinary.uploader.upload(file.path, {
      resource_type: 'video',
      folder: 'vigyana/sections',
    });

    const section = await prisma.section.create({
      data: {
        title,
        courseId,
        videoUrl: upload.secure_url,
      },
    });

    res.status(201).json({ message: 'Section added', section });
  } catch (err) {
    console.error('Add section error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get all recorded sections for a course
exports.getCourseSections = async (req, res) => {
  const { courseId } = req.params;

  try {
    const sections = await prisma.section.findMany({
      where: { courseId },
    });

    res.json(sections);
  } catch (err) {
    console.error('Fetch sections error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🆕 Create a live session for a course
exports.createLiveSession = async (req, res) => {
  const { title, scheduledAt, meetLink } = req.body;
  const { courseId } = req.params;

  if (!title || !scheduledAt || !meetLink) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Optionally: check if instructor is owner or admin (if using `req.user`)
    const session = await prisma.liveSession.create({
      data: {
        title,
        courseId,
        meetLink,
        scheduledAt: new Date(scheduledAt),
      },
    });

    res.status(201).json({ message: 'Live session created', session });
  } catch (err) {
    console.error('Create live session error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🆕 Get all live sessions for a course
exports.getLiveSessions = async (req, res) => {
  const { courseId } = req.params;

  try {
    const sessions = await prisma.liveSession.findMany({
      where: { courseId },
      orderBy: { scheduledAt: 'asc' },
    });

    res.json(sessions);
  } catch (err) {
    console.error('Fetch live sessions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
