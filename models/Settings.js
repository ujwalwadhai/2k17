const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    unique: true
  },
  notifications: {
    email: { type: Boolean, default: true },
    login: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: true },
    push: { type: Boolean, default: false }
  },
  privacy: {
    email: { type: Boolean, default: true },
    dob: { type: Boolean, default: true },
    phone: { type: Boolean, default: true }
  },
  emailVerification: {
    newEmail: String,
    token: String,
    expiry: Date
  },
  passwordReset: {
    token: String,
    expiry: Date
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings
