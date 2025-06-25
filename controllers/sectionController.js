const prisma = require('../config/db');
const cloudinary = require('../config/cloudinary');

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
