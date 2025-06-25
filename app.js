const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const communityRoutes = require('./routes/communityRoutes');
const liveRoutes = require("./routes/liveRoutes");
const liveSessionRoutes = require('./routes/liveSessionRoutes');
const googleCalendarRoutes = require('./routes/googleCalendarRoutes');





const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();

const app = express();

app.use(cors({
  origin: 'https://vigyaana-frontend.vercel.app',
  credentials: true,
}));
app.use(helmet())
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);

app.use('/api/courses', courseRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/community', communityRoutes);
app.use("/api/live", liveRoutes);
app.use('/api/google', googleCalendarRoutes);




app.use('/api/courses', courseRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/livesessions', liveSessionRoutes);

module.exports = app;
