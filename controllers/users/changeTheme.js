var Users = require('../../models/Users');

const changeTheme = async (req, res) => {
  var { theme } = req.body;

  if (!theme) {
    return res.json({ success: false, message: "Theme is required." });
  }

  try {
    await Users.findByIdAndUpdate(req.user._id, { theme }, { new: true });
    return res.json({ success: true, message: "Theme changed successfully." });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Something went wrong." });
  }
};

module.exports = changeTheme;