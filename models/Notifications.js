const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }, // This will be missing if Notification is issued to all users
  type: { type: String, enum: ['like', 'comment', 'tag', 'reply', 'report', 'security', 'birthday'], required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  message: { type: String },   // e.g., "Ujwal commented: Nice one!"
  url: { type: String },       // e.g., "/post/123" to navigate directly
  seen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

var Notifications = mongoose.model('Notifications', notificationSchema);

/* async function createSampleNotification() {
  try {
    const newNotification = await Notifications.create({
      user: new mongoose.Types.ObjectId('68217b91f53d80a21ec6f9c7'),
      type: 'comment',
      fromUser: new mongoose.Types.ObjectId('68217b91f53d80a21ec6f9c9'), // You can use another user's ID
      message: 'Aditya commented: "Nice one!"',
      url: '/post/abc123'
    });

    console.log('Notification created:', newNotification);
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}

createSampleNotification(); */

module.exports = Notifications

