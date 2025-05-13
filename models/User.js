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
userSchema.methods.validatePassword = async function (enteredPassword) {
  if(this.password){
    return await bcrypt.compare(enteredPassword, this.password);
  }
  return enteredPassword === this.code;
};

var User = mongoose.model('Users', userSchema);

/*
const preUsersData = [
  {
    "name": "Aditi Khobragade",
    "dob": "07/10/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Ashish Sopankar",
    "dob": "16/07/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Bhavishya Rangari",
    "dob": "04/09/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Himanshu Mangam",
    "dob": "18/12/2005",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Ketan Mongarkar",
    "dob": "05/07/2005",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Akshita Ray",
    "dob": "01/07/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Aditi Zade",
    "dob": "24/10/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Naina Khadsang",
    "dob": "28/06/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Prajwal Chaudhari",
    "dob": "14/07/2005",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Prajwali Tajane",
    "dob": "07/09/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Prajyot Meshram",
    "dob": "21/05/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Prajyot Raut",
    "dob": "06/10/2005",
    "profilePicture": "",
    "role": "moderator",
    "year": "2020-24"
  },
  {
    "name": "Ritik Madavi",
    "dob": "28/04/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Rutuja Kamdi",
    "dob": "08/07/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Samiksha Chunarkar",
    "dob": "28/04/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Samyak Sakhare",
    "dob": "22/10/2005",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Shankar Bharde",
    "dob": "08/09/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Sneha Togare",
    "dob": "01/01/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Trupti Raut",
    "dob": "28/10/2005",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Ujwal Wadhai",
    "dob": "13/09/2006",
    "profilePicture": "/images/ujwal_profile.jpg",
    "role": "admin",
    "year": "2017-24"
  },
  {
    "name": "Khushi Ramteke",
    "dob": "31/03/2007",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Aditya Patil",
    "dob": "24/02/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Manasvi Borkar",
    "dob": "01/05/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Bhairavi Gedam",
    "dob": "01/10/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Manthan Suryawanshi",
    "dob": "12/03/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Monali Chandanbawane",
    "dob": "18/10/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Rhutik Kunbhare",
    "dob": "22/03/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Paresh Nimje",
    "dob": "13/04/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Pranjal Madkam",
    "dob": "26/10/2005",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Sejal Ragit",
    "dob": "28/04/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Shrishant Bagale",
    "dob": "06/11/2005",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Shrushti Khandare",
    "dob": "25/04/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Suhani Chaudhary",
    "dob": "31/05/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Vaishnavi Shedala",
    "dob": "05/11/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Vedanti Fukat",
    "dob": "18/10/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Yash Magare",
    "dob": "02/10/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Shraddha Pakhmode",
    "dob": "27/10/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2020-24"
  },
  {
    "name": "Vivekanand Puram",
    "dob": "08/02/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Manali Humane",
    "dob": "25/10/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Sagar Barekar",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Milind Ghodmare",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Vaibhav Nannaware",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Piyush Shende",
    "dob": "14/10/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Krish Ninawe",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Shrawan Borkar",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Sanskar Kayarkar",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Dweep Raut",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Manas Dawande",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Dhruv Meshram",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Rohit Thakare",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Aryan Shelke",
    "dob": "16/12/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Smith Navale",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Aharth Nimgade",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Sneha Bhagat",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2020-24"
  },
  {
    "name": "Sanika Bawane",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Pooja Moon",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Purva Patil",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Pradnya Chahande",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Janavi Magare",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Chaitali Shende",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Akansha Satpute",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Palak Thakare",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Ayusha Urade",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Priyanka Surpam",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Sanika Nagrale",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Parikshit Doye",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Harshal Hulke",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Sanskar Hanwate",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Kshitij Urade",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Sahil Kurzekar",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Krish Dange",
    "dob": "27/06/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Krishna Jadhav",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Sudhanshu Randhai",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Hrichita Pal",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Vedika Shende",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2020-24"
  },
  {
    "name": "Kalyani Gedam",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Neha Gedam",
    "dob": "03/05/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Kimaya Pawade",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Nandini Ladwe",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Shrawani Sahare",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Spandan Bansod",
    "dob": "",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  },
  {
    "name": "Manasi Naoghade",
    "dob": "31/01/2006",
    "profilePicture": "",
    "role": "user",
    "year": "2017-24"
  }
]

try {
  preUsersData.forEach((user) => {
    var userData = new User({
      name: user.name,
      username: user.name.replace(/\s+/g, '').toLowerCase(),
      dob: user.dob,
      password: user.dob,
      email: "",
      phone: "",
      profilePicture: user.profilePicture,
      role: user.role,
      year: user.year,
      bio: "",
      socialLinks: {
        instagram: "",
        linkedin: "",
        github: "",
        facebook: "",
        other: ""
      }
    })
    userData.save();
  })

  console.log(`Inserted ${preUsersData.length + 1} pre-users.`);
} catch (err) {
  console.error('Insert error:', err);
  mongoose.connection.close();
}
*/


module.exports = User
