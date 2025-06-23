const { google } = require('googleapis');
const prisma = require('../config/db'); // adjust path to your prisma instance

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://vigyaana-server.onrender.com/api/google/oauth-callback' // Must match Google Console
);

// 👉 Step 1: Generate the Google Auth URL
const generateAuthUrl = async (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid'
    ],
  });

  res.json({ url });
};


const handleOAuthCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // ✅ Decode user email from token
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    // 🔐 Store token in DB
    await prisma.googleToken.upsert({
      where: { email },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
      },
      create: {
        email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date,
      },
    });

    res.redirect(`https://vigyaana-frontend.vercel.app/dashboard?calendar_connected=true`);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ message: 'OAuth failed', error: error.message });
  }
};

module.exports = { generateAuthUrl, handleOAuthCallback };
