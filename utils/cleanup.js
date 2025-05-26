var Reports = require('../models/Reports');
var Logs = require('../models/Logs');

async function CleanUp() {
    try {
        var reportretentionPeriod = process.env.REPORTS_RETENTION_PERIOD || 7;
        var reportthreshold = new Date(Date.now() - reportretentionPeriod * 24 * 60 * 60 * 1000);
        await Reports.deleteMany({
            resolution: { $exists: true, $ne: '' },
            updatedAt: { $lte: reportthreshold },
        });
        var logretentionPeriod = process.env.LOGS_RETENTION_PERIOD || 30;
        var logthreshold = new Date(Date.now() - logretentionPeriod * 24 * 60 * 60 * 1000);
        await Logs.deleteMany({ createdAt: { $lt: logthreshold } });
    } catch (err) {
        console.error('[LOG CLEANUP ERROR]', err);
    }
};

module.exports = CleanUp;