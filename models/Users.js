const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String },
  year: { type: String },
  phone: { type: String }, 
  dob: { type: String },
  password: { type: String, select: false },
  profile: { type: String },
  bio: { type: String },
  registered: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  socialLinks: {
    instagram: String,
    linkedin: String,
    github: String,
    facebook: String,
    other: String
  },
  code: { type: String, select: false },
  emailVerificationToken: { type: String },
  role: { type: String, enum: ['admin', 'moderator']},
  joinedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


// Hash the password before saving to database
userSchema.pre('save', async function (next) {
    if (this.isModified('password')){ // Don't hash if password isn't modified
        try {
            const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
            this.password = await bcrypt.hash(this.password, salt); // Hash the password
        } catch (err) {
        }
    }

    this.updatedAt = Date.now();
    next();
});

// Method to compare password (for login)
userSchema.methods.validatePassword = async function (enteredPassword) {
  if(this.password){
    return await bcrypt.compare(enteredPassword, this.password);
  }
  return enteredPassword === this.code;
};

module.exports = mongoose.model('Users', userSchema);
