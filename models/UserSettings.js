const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  theme: {
    type: String,
    default: 'dark'
  },
  notifications: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: String
  }
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);
