const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    unique: true
  },

  emailNotifications: {
    type: Boolean,
    default: true
  },

  loginAlerts: {
    type: Boolean,
    default: true
  },

  emailUpdates: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Settings', userSettingsSchema);
