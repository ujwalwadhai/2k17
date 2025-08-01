var Reports = require('../../models/Reports');
var Users = require('../../models/Users');
var sendMail = require('../../config/mailer');
var logActivity = require('../../utils/log');

const newReport = async (req, res) => {
  try {
    var { subject, details } = req.body;
    if (!subject || !details) {
      return res.json({ success: false, message: "All fields are required." });
    }

    var newReport = new Reports({
      user: req.user?._id || null,
      subject,
      details
    });

    await newReport.save();

    var admins = await Users.find({ role: 'admin' }).select('email -_id');
    var adminEmails = admins.map(user => user.email);

    if(req.user?.email) {
      await sendMail('report_user', req.user.email, { subject, details, name: req.user.name.split(' ')[0], reportId: newReport._id });
    }
    await sendMail('report_admins', adminEmails, { subject, details, name: req.user?.name || ''});
    logActivity(req.user._id, `Filed a report (${newReport._id})`);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Error saving report." });
  }
}

module.exports = newReport;