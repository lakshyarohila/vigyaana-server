const express = require("express");
const router = express.Router();
const prisma = require("../config/db");
const protect = require("../middleware/auth");

// ✅ POST - Create live session for a course
router.post("/:courseId/live-sessions", protect, async (req, res) => {
  const { courseId } = req.params;
  const { topic, meetLink, scheduledAt } = req.body;

  if (!topic || !meetLink || !scheduledAt) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Validate course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Only allow instructor (or admin if you want to extend)
    if (course.createdById !== req.user.id) {
      return res.status(403).json({ message: "Not allowed to add live session to this course" });
    }

    const live = await prisma.liveSession.create({
      data: {
        topic,
        meetLink,
        scheduledAt: new Date(scheduledAt),
        course: { connect: { id: courseId } },
      },
    });

    res.status(201).json(live);
  } catch (err) {
    console.error("Live session error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// ✅ GET - Get all live sessions for a course
router.get("/:courseId/live-sessions", protect, async (req, res) => {
  const { courseId } = req.params;

  try {
    const sessions = await prisma.liveSession.findMany({
      where: { courseId },
      orderBy: { scheduledAt: "asc" },
    });

    res.json(sessions);
  } catch (err) {
    console.error("Fetch sessions failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
