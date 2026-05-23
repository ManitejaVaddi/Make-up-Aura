import http from 'http';
import app from './app.js';
import { startReminderJob } from './jobs/reminderJob.js';

const PORT = Number(process.env.PORT || 5000);

startReminderJob();
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
