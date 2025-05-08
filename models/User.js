const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: { 
        type: String, 
        required: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    profilePicture: { 
        type: String,
        default: 'https://res.cloudinary.com/your-cloud-name/default-profile.jpg' // Default profile image URL
    },
    bio: { 
        type: String 
    },
    createdAt: { 
        type: String
    }
});

// Hash the password before saving to database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Don't hash if password isn't modified
    try {
        const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
        this.password = await bcrypt.hash(this.password, salt); // Hash the password
        next();
    } catch (err) {
        next(err); // Handle error
    }
});

// Method to compare password (for login)
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password); // Compare entered password with hashed password
};

module.exports = mongoose.model('Users', userSchema);
