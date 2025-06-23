const express = require('express');
const { generateAuthUrl, handleOAuthCallback } = require('../controllers/googleCalendarController');

const router = express.Router();

router.get('/initiate-auth', generateAuthUrl);
router.get('/oauth-callback', handleOAuthCallback);

module.exports = router;
