const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (!['.jpg', '.jpeg', '.png', '.mp4', '.mov'].includes(ext)) {
    cb(new Error('Unsupported file type'), false);
  } else {
    cb(null, true);
  }
};

module.exports = multer({ storage, fileFilter });
