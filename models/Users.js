const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var sendMail = require('../config/mailer');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String },
  year: { type: String, default: "2017-24" },
  phone: { type: String },
  dob: { type: String },
  password: { type: String, select: false },
  profile: { type: String },
  bio: { type: String },
  registered: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  socialLinks: { type: Object, default: {} },
  code: { type: String, select: false },
  role: { type: String, enum: ['admin', 'moderator'] },
  joinedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  lastActive: {
    type: Date,
    default: null,
  },
  pushSubscriptions: [{
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    }
  }]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// Hash the password before saving to database
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) { // Don't hash if password isn't modified
    try {
      const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
      this.password = await bcrypt.hash(this.password, salt); // Hash the password
    } catch (err) {
      console.log(err);
    }
  }

  this.updatedAt = Date.now();
  next();
});

// Method to compare password (for login)
userSchema.methods.validatePassword = async function (enteredPassword) {
  if (this.password) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
  return enteredPassword === this.code;
};

userSchema.virtual('settings', {
  ref: 'Settings',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

const Users = mongoose.model('Users', userSchema);

module.exports = Users
