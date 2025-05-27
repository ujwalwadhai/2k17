var Reports = require('../../models/Reports');
var sendMail = require('../../config/mailer');
var logActivity = require('../../utils/log');

const resolveReport = async (req, res) => {
  try {
    var { reportId, resolution } = req.body;
    if (!reportId || !resolution) {
      return res.json({ success: false, message: "All fields are required." });
    }

    var report = await Reports.findById(reportId).populate('user', 'email');
    report.resolution = resolution;
    await report.save();
    await logActivity(req.user._id, 'Resolved Report', `Resolved a report (${reportId})`);
    await sendMail('report_resolved', report.user?.email, { subject: report.subject, details: report.details, resolution });
    res.json({ success: true, message: 'Report resolved' });
  } catch(err){
    console.log(err)
    res.json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = resolveReport;