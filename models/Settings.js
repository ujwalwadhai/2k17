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

module.exports = mongoose.model('Settings', settingsSchema);
