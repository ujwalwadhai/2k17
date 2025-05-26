var cron = require('node-cron');
var Logs = require('../models/Logs');
var logActivity = require('../utils/log');

cron.schedule('0 0 * * *', async () => {
  try {
    var retentionPeriod = process.env.LOGS_RETENTION_PERIOD || 30; // In days, 30 days default
    var threshold = new Date(Date.now() - retentionPeriod * 24 * 60 * 60 * 1000);
    var result = await Logs.deleteMany({ createdAt: { $lt: threshold } });
    logActivity('', "CLEANUP", `Deleted ${result.deletedCount} logs older than ${retentionPeriod} days.`)
  } catch (err) {
    console.error('[LOG CLEANUP ERROR]', err);
  }
});
