var cron = require('node-cron');
var Sessions = require('../models/Sessions');
var logActivity = require('../utils/log');

cron.schedule('30 0 * * *', async () => {
  try {
    const sessions = await Sessions.countDocuments({ expires: { $lt: Date.now() } });

    if (sessions > 0) {
      const result = await Sessions.deleteMany({ expires: { $lt: Date.now() } });
      const istNowStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const istNow = new Date(istNowStr);

      logActivity('', `Deleted ${result.deletedCount} expired sessions`, istNow);
    }
  } catch (err) {
    console.error('[SESSION CLEANUP ERROR]', err);
  }
}, {
  timezone: 'Asia/Kolkata'
});
