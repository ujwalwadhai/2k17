const mongoose = require('mongoose');
var { getRelativeTime } = require('../utils/time');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  type: { type: String, enum: ['like', 'comment', 'postreact', 'mention', 'report', 'badge', 'birthday', 'admin'], required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  message: { type: String },
  url: { type: String },
  icon: { type: String },
  seen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.virtual('timeAgo').get(function () {
  return getRelativeTime(this.createdAt);
});

notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notifications', notificationSchema); 