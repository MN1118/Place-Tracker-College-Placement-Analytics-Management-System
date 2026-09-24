const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const { CLIENT_URL, NODE_ENV } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const studentsRoutes = require('./routes/students.routes');
const companiesRoutes = require('./routes/companies.routes');
const jobsRoutes = require('./routes/jobs.routes');
const applicationsRoutes = require('./routes/applications.routes');
const interviewsRoutes = require('./routes/interviews.routes');
const placementsRoutes = require('./routes/placements.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const departmentsRoutes = require('./routes/departments.routes');
const reportsRoutes = require('./routes/reports.routes');

const app = express();

// Trust Render's reverse proxy
app.set('trust proxy', 1);

app.use(helmet());

app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));

app.use(express.urlencoded({ extended: true }));

app.use(compression());

if (NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);

app.use('/api/students', studentsRoutes);

app.use('/api/companies', companiesRoutes);

app.use('/api/jobs', jobsRoutes);

app.use('/api/applications', applicationsRoutes);

app.use('/api/interviews', interviewsRoutes);

app.use('/api/placements', placementsRoutes);

app.use('/api/analytics', analyticsRoutes);

app.use('/api/notifications', notificationsRoutes);

app.use('/api/departments', departmentsRoutes);

app.use('/api/reports', reportsRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;