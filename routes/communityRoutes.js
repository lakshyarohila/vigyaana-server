const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const prisma = require('../config/db');

// GET all messages
router.get('/', protect, async (req, res) => {
  try {
    const messages = await prisma.communityMessage.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, id: true } }
      }
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// POST a new message
router.post('/', protect, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }

  try {
    const newMessage = await prisma.communityMessage.create({
      data: {
        content,
        userId: req.user.id,
      },
      include: {
        user: { select: { name: true, id: true } }
      }
    });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post message' });
  }
});

module.exports = router;
