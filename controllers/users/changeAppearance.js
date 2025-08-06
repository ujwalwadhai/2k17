var Users = require('../../models/Users');

const changeTheme = async (req, res) => {
  var { theme, font } = req.body;

  if (!theme || !font) {
    return res.json({ success: false, message: "All fields are required." });
  }

  try {
    await Users.findByIdAndUpdate(req.user._id, { theme, font }, { new: true });
    return res.json({ success: true, message: "Preferences saved successfully." });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Something went wrong." });
  }
};

module.exports = changeTheme;