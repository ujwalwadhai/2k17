const mongoose = require('mongoose');

const preUserSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  used: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  emailVerificationExpires: Date,
});

module.exports = mongoose.model('PreUsers', preUserSchema);
