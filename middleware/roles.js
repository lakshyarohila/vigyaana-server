const isStudent = (req, res, next) => {
  if (req.user.role !== 'STUDENT') {
    return res.status(403).json({ message: 'Access denied: Students only' });
  }
  next();
};

const isInstructor = (req, res, next) => {
  if (req.user.role !== 'INSTRUCTOR') {
    return res.status(403).json({ message: 'Access denied: Instructors only' });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

module.exports = { isStudent, isInstructor, isAdmin };
