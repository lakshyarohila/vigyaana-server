const prisma = require('../config/db');

exports.getMyCertificates = async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId: req.user.id },
      include: {
        course: true,
      },
    });

    res.json(certificates);
  } catch (err) {
    console.error('Get certificates error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
