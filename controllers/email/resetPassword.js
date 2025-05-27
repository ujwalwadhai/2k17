var Settings = require("../../models/Settings");
var logActivity = require("../../utils/log");

const resetPassword = async (req, res) => {
  var { token, password, confirmPassword } = req.body;
  var settings = await Settings.findOne({ "passwordReset.token": token }).populate('user');

  if (!settings || settings.passwordReset.expiry < Date.now()) {
    return res.json({ success: false, message: "Token expired or invalid." });
  }

  if(password !== confirmPassword) return res.json({ success: false, message: "Passwords do not match." });

  settings.user.password = password;
  await settings.user.save();

  settings.passwordReset = undefined;
  await settings.save();
  logActivity(settings.user._id, 'Password Reset', `Password reset by email verification.`);

  res.json({ success: true, message: "Password updated successfully." });
};

module.exports = resetPassword;