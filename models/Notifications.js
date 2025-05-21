const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }, // This will be missing if Notification is issued to all users
  type: { type: String, enum: ['like', 'comment', 'tag', 'reply', 'report', 'security', 'birthday'], required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  message: { type: String },   // e.g., "Ujwal commented: Nice one!"
  url: { type: String },       // e.g., "/post/123" to navigate directly,
  icon: {type: String},
  seen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

var Notifications = mongoose.model('Notifications', notificationSchema);

module.exports = Notifications

 