var Users = require('../../models/Users');
var logActivity = require('../../utils/log');

const changePassword = async (req, res) => {
  var { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.json({ success: false, message: "All fields are required." });
  }

  if (newPassword !== confirmPassword) {
    return res.json({ success: false, message: "New passwords do not match." });
  }

  try {
    var user = await Users.findById(req.user._id).select('+password +code');

    var isMatch = await user.validatePassword(currentPassword);
    if (!isMatch) {
      return res.json({ success: false, message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();
    logActivity(user._id, 'Changed password');
    return res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Something went wrong." });
  }
};

module.exports = changePassword;