const prisma = require('../config/db');

// ✅ Create a live session (simplified version)
const createLiveSession = async (req, res) => {
  try {
    const { courseId, topic, scheduledAt } = req.body;

    if (!courseId || !topic || !scheduledAt) {
      return res.status(400).json({ message: 'Course ID, topic, and scheduled time are required' });
    }

    // Validate that the course exists and belongs to the instructor
    const course = await prisma.course.findUnique({ 
      where: { id: courseId },
      select: { id: true, createdById: true, type: true }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.createdById !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create session for this course' });
    }

    if (course.type !== 'LIVE') {
      return res.status(400).json({ message: 'Live sessions can only be created for LIVE courses' });
    }

    // Create live session with a default meet link (you can enhance this later)
    const meetLink = `https://meet.google.com/${Math.random().toString(36).substring(7)}`;

    const liveSession = await prisma.liveSession.create({
      data: {
        topic,
        courseId,
        meetLink,
        scheduledAt: new Date(scheduledAt),
      },
    });

    res.status(201).json({
      message: 'Live session created successfully',
      session: liveSession
    });

  } catch (err) {
    console.error('Create live session error:', err);
    res.status(500).json({ message: 'Failed to create live session' });
  }
};

// ✅ Get all live sessions for a course
const getLiveSessionsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

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

module.exports = {
  createLiveSession,
  getLiveSessionsByCourse,
};