var Users = require("../../models/Users");
var Settings = require("../../models/Settings");
var sendMail = require("../../config/mailer");
var logActivity = require("../../utils/log");

const requestPasswordReset = async (req, res) => {
  var { email } = req.body;
  if(!email) return res.json({ success: false, message: "Please enter email." })
  try {
    var user = await Users.findOne({ email });
    if (!user) return res.json({ success: false, message: "Email not registered." });

    var token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    var expiry = Date.now() + 60 * 60 * 1000;

    await Settings.findOneAndUpdate(
      { user: user._id },
      { passwordReset: { token, expiry } }
    );

    var link = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
    await sendMail('reset-password', email, {link, name: user.name});
    logActivity(user._id, 'Password Reset Request', `Requested password reset.`);
    res.json({ success: true, message: "Reset link sent to your email." });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Something went wrong." });
  }
};

module.exports = requestPasswordReset;