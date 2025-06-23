const { google } = require('googleapis');
const prisma = require('../config/db');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://vigyaana-server.onrender.com/api/google/oauth-callback'
);

const createLiveSession = async (req, res) => {
  const { courseId, title, description, startTime, endTime } = req.body;

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId }, include: { createdBy: true } });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const tokenRecord = await prisma.googleToken.findUnique({ where: { email: course.createdBy.email } });
    if (!tokenRecord) return res.status(403).json({ message: 'Instructor has not connected Google Calendar' });

    oauth2Client.setCredentials({
      access_token: tokenRecord.accessToken,
      refresh_token: tokenRecord.refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: title,
      description,
      start: { dateTime: new Date(startTime).toISOString() },
      end: { dateTime: new Date(endTime).toISOString() },
      conferenceData: {
        createRequest: {
          requestId: `${courseId}-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const calendarRes = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink = calendarRes.data.hangoutLink;

    const session = await prisma.session.create({
      data: {
        courseId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type: 'LIVE',
        meetLink,
      },
    });

    res.status(201).json({ message: 'Live session created', session });
  } catch (err) {
    console.error('Create live session error:', err);
    res.status(500).json({ message: 'Failed to create session', error: err.message });
  }
};

module.exports = { createLiveSession };
