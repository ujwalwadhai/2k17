const mongoose = require('mongoose');
var { createDate } = require('../utils/dateFunctions');
var bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true }, // e.g. ujwal.wadhai
  email: { type: String },
  year: { type: String },
  phone: { type: String }, // Optional
  dob: { type: String }, // Stored in DD/MM/YYYY format
  password: { type: String }, // DOB for now
  profilePicture: { type: String, default: '/images/user.png' }, // Cloudinary URL
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
  code: { type: String },
  emailVerificationToken: { type: String },
  role: { type: String, enum: ['admin', 'moderator']},
  joinedAt: { type: String },
  updatedAt: { type: String }
});


// Hash the password before saving to database
userSchema.pre('save', async function (next) {
    if (this.isModified('password')){ // Don't hash if password isn't modified
        try {
            const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
            this.password = await bcrypt.hash(this.password, salt); // Hash the password
        } catch (err) {
            console.log(err); // Handle error
        }
    }

    this.updatedAt = createDate();
    next();
});

// Method to compare password (for login)
userSchema.methods.validatePassword = async function (enteredPassword) {
  if(this.password){
    return await bcrypt.compare(enteredPassword, this.password);
  }
  return enteredPassword === this.code;
};

var Users = mongoose.model('Users', userSchema);

module.exports = Users
