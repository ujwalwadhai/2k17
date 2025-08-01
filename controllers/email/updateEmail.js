var Settings = require('../../models/Settings');
var sendMail = require("../../config/mailer");
var logActivity = require("../../utils/log");

const updateEmail = async (req, res) => {
  try {
    var { newEmail } = req.body;
    if (!newEmail) return res.json({ success: false, message: "Email is required." });

    var token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    var expiry = new Date(Date.now() + 1000 * 60 * 30);

    var settings = await Settings.findOneAndUpdate(
      { user: req.user._id },
      { emailVerification: { newEmail, token, expiry } },
      { new: true, upsert: true }
    );

    var link = `${req.protocol}://${req.get('host')}/verify-email/${token}`;

    await sendMail('verify-new-email', newEmail, {link, name: req.user.name});
    logActivity(req.user._id, `Requested change of email.`);
    return res.json({ success: true, message: 'Verification email sent.' });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Server error.' });
  }
}

module.exports = updateEmail;