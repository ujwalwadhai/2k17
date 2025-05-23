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
    newsletter: { type: Boolean, default: true }
  },
  emailVerification: {
    newEmail: { type: String },
    token: { type: String },
    expiry: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
