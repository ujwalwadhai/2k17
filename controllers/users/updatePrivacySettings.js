var Settings = require('../../models/Settings');
var Users = require('../../models/Users');

const updatePrivacySettings = async (req, res) => {
  try {
    var userId = req.user._id;

    var privacy = {
      email: req.body.email || false,
      phone: req.body.phone || false,
      dob: req.body.dob || false
    };

    var settings = await Settings.findOneAndUpdate(
      { user: userId },
      { $set: {privacy} },
      { new: true, upsert: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: 'Something went wrong' });
  }
};

module.exports = updatePrivacySettings;