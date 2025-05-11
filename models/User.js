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
  socialLinks: {
    instagram: String,
    linkedin: String,
    github: String,
    facebook: String,
    other: String
  },

  // Temporary fields for one-time use
  code: { type: String }, // Deleted after user activates
  emailVerificationToken: { type: String }, // Deleted after email is verified

  // Roles
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },

  // Metadata
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
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password); // Compare entered password with hashed password
};

/*

const preUsersData = [
  {
    "name": "Aditi Khobragade",
    "dob": "07/10/2006",
    "password": "07/10/2006"
  },
  {
    "name": "Aditi Zade",
    "dob": "24/10/2006",
    "password": "24/10/2006"
  },
  {
    "name": "Akshita Ray",
    "dob": "01/07/2006",
    "password": "01/07/2006"
  },
  {
    "name": "Ashish Sopankar",
    "dob": "16/07/2006",
    "password": "16/07/2006"
  },
  {
    "name": "Bhavishya Rangari",
    "dob": "04/09/2006",
    "password": "04/09/2006"
  },
  {
    "name": "Himanshu Mangam",
    "dob": "18/12/2005",
    "password": "18/12/2005"
  },
  {
    "name": "Ketan Mongarkar",
    "dob": "05/07/2005",
    "password": "05/07/2005"
  },
  {
    "name": "Khushi Ramteke",
    "dob": "31/03/2007",
    "password": "31/03/2007"
  },
  {
    "name": "Manasvi Borkar",
    "dob": "01/05/2006",
    "password": "01/05/2006"
  },
  {
    "name": "Naina Khadsang",
    "dob": "28/06/2006",
    "password": "28/06/2006"
  },
  {
    "name": "Prajwal Chaudhari",
    "dob": "14/07/2005",
    "password": "14/07/2005"
  },
  {
    "name": "Prajwali Tajane",
    "dob": "07/09/2006",
    "password": "07/09/2006"
  },
  {
    "name": "Prajyot Meshram",
    "dob": "21/05/2006",
    "password": "21/05/2006"
  },
  {
    "name": "Prajyot Raut",
    "dob": "06/10/2005",
    "password": "06/10/2005"
  },
  {
    "name": "Ritik Madavi",
    "dob": "28/04/2006",
    "password": "28/04/2006"
  },
  {
    "name": "Rutuja Kamdi",
    "dob": "08/07/2006",
    "password": "08/07/2006"
  },
  {
    "name": "Samiksha Chunarkar",
    "dob": "28/04/2006",
    "password": "28/04/2006"
  },
  {
    "name": "Samyak Sakhare",
    "dob": "22/10/2005",
    "password": "22/10/2005"
  },
  {
    "name": "Shankar Bharde",
    "dob": "08/09/2006",
    "password": "08/09/2006"
  },
  {
    "name": "Sneha Togare",
    "dob": "01/01/2006",
    "password": "01/01/2006"
  },
  {
    "name": "Trupti Raut",
    "dob": "28/10/2005",
    "password": "28/10/2005"
  },
  {
    "name": "Ujwal Wadhai",
    "dob": "13/09/2006",
    "password": "13/09/2006"
  },
  {
    "name": "Vivekanand Puram",
    "dob": "08/02/2006",
    "password": "08/02/2006"
  },
  {
    "name": "Aditya Patil",
    "dob": "24/02/2006",
    "password": "24/02/2006"
  },
  {
    "name": "Bhairavi Gedam",
    "dob": "01/10/2006",
    "password": "01/10/2006"
  },
  {
    "name": "Manali Humane",
    "dob": "25/10/2006",
    "password": "25/10/2006"
  },
  {
    "name": "Manthan Suryawanshi",
    "dob": "12/03/2006",
    "password": "12/03/2006"
  },
  {
    "name": "Monali Chandanbawane",
    "dob": "18/10/2006",
    "password": "18/10/2006"
  },
  {
    "name": "Paresh Nimje",
    "dob": "13/04/2006",
    "password": "13/04/2006"
  },
  {
    "name": "Pranjal Madkam",
    "dob": "26/10/2005",
    "password": "26/10/2005"
  },
  {
    "name": "Rhutik Kunbhare",
    "dob": "22/03/2006",
    "password": "22/03/2006"
  },
  {
    "name": "Sejal Ragit",
    "dob": "28/04/2006",
    "password": "28/04/2006"
  },
  {
    "name": "Shrishant Bagale",
    "dob": "06/11/2005",
    "password": "06/11/2005"
  },
  {
    "name": "Shrushti Khandare",
    "dob": "25/04/2006",
    "password": "25/04/2006"
  },
  {
    "name": "Suhani Chaudhary",
    "dob": "31/05/2006",
    "password": "31/05/2006"
  },
  {
    "name": "Vaishnavi Shedala",
    "dob": "05/11/2006",
    "password": "05/11/2006"
  },
  {
    "name": "Vedanti Fukat",
    "dob": "18/10/2006",
    "password": "18/10/2006"
  },
  {
    "name": "Yash Magare",
    "dob": "02/10/2006",
    "password": "02/10/2006"
  },
  {
    "name": "Shraddha Pakhmode",
    "dob": "27/10/2006",
    "password": "27/10/2006"
  }
]

try {
  preUsersData.forEach((user) => {
    var userData = new User({
      name: user.name,
      username: user.name.replace(/\s+/g, '').toLowerCase(),
      dob: user.dob,
      password: user.dob
    })
    userData.save();
  })

  console.log(`Inserted ${preUsersData.length + 1} pre-users.`);
} catch (err) {
  console.error('Insert error:', err);
  mongoose.connection.close();
} */

var User = mongoose.model('Users', userSchema);



module.exports = User
