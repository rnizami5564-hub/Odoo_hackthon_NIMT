require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/auth.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const leaveRoutes = require('./routes/leave.routes');

const app = express();
const port = Number(process.env.PORT || 3000);

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error('Unhandled request error:', error);
  return res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`HRMS API listening on port ${port}`);
  });
}

module.exports = app;
