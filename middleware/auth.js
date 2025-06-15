const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ FIX: Handle both JWT structures (userId from regular login, id from Google)
    const userId = decoded.userId || decoded.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token structure' });
    }
    
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = protect;