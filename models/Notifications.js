const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // receiver
  type: { type: String, enum: ['like', 'comment', 'tag'], required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String },   // e.g., "Ujwal commented: Nice one!"
  url: { type: String },       // e.g., "/post/123" to navigate directly
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notifications', notificationSchema);
