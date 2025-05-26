const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { isStudent } = require('../middleware/roles');
const { getMyCertificates } = require('../controllers/certificateController');

router.get('/', protect, isStudent, getMyCertificates);

module.exports = router;
