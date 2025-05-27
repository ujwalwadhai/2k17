var Notifications = require('../../models/Notifications');

const fetchNotifications = async (req, res) => {
  try {
    var notifications = await Notifications.find({
      $or: [
        { user: req.user._id },
        { user: { $exists: false } }
      ]
    }).sort({ createdAt: -1 }).populate('fromUser', 'username profile');
    return res.json({ success: true, notifications });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Something went wrong' });
  }
};

module.exports = fetchNotifications;