var cron = require('node-cron');
var Reports = require('../models/Reports');
var logActivity = require('../utils/log');

cron.schedule('5 0 * * *', async () => {
  var sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    var result = await Reports.deleteMany({
      resolution: { $exists: true, $ne: '' },
      updatedAt: { $lte: sevenDaysAgo },
    });

    console.log(`[CRON] Deleted ${result.deletedCount} resolved reports older than 7 days.`);
  } catch (error) {
    console.error('[CRON] Error deleting old resolved reports:', error);
  }
}, {
    timezone: "Asia/Kolkata"
});
