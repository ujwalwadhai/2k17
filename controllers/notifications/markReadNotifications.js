var Notifications = require('../../models/Notifications');

const markReadNotifications = async (req, res) => {
  try {
    await Notifications.updateMany(
      { user: req.user._id, seen: false },
      { $set: { seen: true } }
    );
    return res.json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = markReadNotifications;