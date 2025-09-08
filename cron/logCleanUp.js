var cron = require('node-cron');
var Logs = require('../models/Logs');
var logActivity = require('../utils/log');

cron.schedule('5 0 * * *', async () => {
  try {
    const retentionPeriod = process.env.LOGS_RETENTION_PERIOD || 30;
    const threshold = new Date(Date.now() - retentionPeriod * 24 * 60 * 60 * 1000);
    const logs = await Logs.countDocuments({ createdAt: { $lt: threshold } });

    if (logs > 0) {
      const result = await Logs.deleteMany({ createdAt: { $lt: threshold } });
      const istNowStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const istNow = new Date(istNowStr);
    }
  } catch (err) {
    console.error('[LOG CLEANUP ERROR]', err);
  }
}, {
  timezone: 'Asia/Kolkata'
});
