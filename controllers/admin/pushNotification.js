const sendPushNotification = require('../../utils/push');
const Notifications = require('../../models/Notifications');

const pushNotification = async (req, res) => {
  const { title, body, url } = req.body;
  try {
  var notification = new Notifications({
    user: null,
    type: 'admin',
    fromUser: req.user._id,
    message: title+'<br>'+body,
    url: url || '/'
  })
  await notification.save();
  
  await sendPushNotification({
        userId: null,
        type: 'admin',
        data: {
          title,
          body,
          url: url || '/'
        }
    });

    res.status(200).json({success: true, message: "Notification sent successfully" });
  } catch (error) {
    res.status(500).json({success:false, message: "Error: "+ error });
  }
}

module.exports = pushNotification;