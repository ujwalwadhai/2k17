var Settings = require('../../models/Settings');
var Users = require('../../models/Users');

const updateSettings = async (req, res) => {
  try {
    var userId = req.user._id;

    var notifications = {
      email: req.body.email || false,
      login: req.body.login || false,
      push: req.body.push || false
      //,newsletter: req.body.newsletter || false,
    };

    var settings = await Settings.findOneAndUpdate(
      { user: userId },
      { $set: {notifications} },
      { new: true, upsert: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: 'Something went wrong' });
  }
};

module.exports = updateSettings;