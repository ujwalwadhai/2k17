var mongoose = require('mongoose');

const preUserSchema = new mongoose.Schema({
  code: { type: String },
  name: { type: String, required: true },
  profileUrl: { type: String },
  phone: { type: String },
  username: { type: String },
  email: { type: String },
  year: { type: String },
  used: { type: Boolean, default: false },
  bio: { type: String },
  emailVerified: { type: Boolean, default: false },
  emailVerificationExpires: {type: String}
});

const PreUser = mongoose.model('PreUser', preUserSchema);

/*
const preUsersData = [
  {
    "name": "Aditi Khobragade",
    "dob": "07/10/2006"
  },
  {
    "name": "Aditi Zade",
    "dob": "24/10/2006"
  },
  {
    "name": "Akshita Ray",
    "dob": "01/07/2006"
  },
  {
    "name": "Ashish Sopankar",
    "dob": "16/07/2006"
  },
  {
    "name": "Bhavishya Rangari",
    "dob": "04/09/2006"
  },
  {
    "name": "Himanshu Mangam",
    "dob": "18/12/2005"
  },
  {
    "name": "Ketan Mongarkar",
    "dob": "05/07/2005"
  },
  {
    "name": "Khushi Ramteke",
    "dob": "31/03/2007"
  },
  {
    "name": "Manasvi Borkar",
    "dob": "01/05/2006"
  },
  {
    "name": "Naina Khadsang",
    "dob": "28/06/2006"
  },
  {
    "name": "Prajwal Chaudhari",
    "dob": "14/07/2005"
  },
  {
    "name": "Prajwali Tajane",
    "dob": "07/09/2006"
  },
  {
    "name": "Prajyot Meshram",
    "dob": "21/05/2006"
  },
  {
    "name": "Prajyot Raut",
    "dob": "06/10/2005"
  },
  {
    "name": "Ritik Madavi",
    "dob": "28/04/2006"
  },
  {
    "name": "Rutuja Kamdi",
    "dob": "08/07/2006"
  },
  {
    "name": "Samiksha Chunarkar",
    "dob": "28/04/2006"
  },
  {
    "name": "Samyak Sakhare",
    "dob": "22/10/2005"
  },
  {
    "name": "Shankar Bharde",
    "dob": "08/09/2006"
  },
  {
    "name": "Sneha Togare",
    "dob": "01/01/2006"
  },
  {
    "name": "Trupti Raut",
    "dob": "28/10/2005"
  },
  {
    "name": "Ujwal Wadhai",
    "dob": "13/09/2006"
  },
  {
    "name": "Vivekanand Puram",
    "dob": "08/02/2006"
  },
  {
    "name": "Aditya Patil",
    "dob": "24/02/2006"
  },
  {
    "name": "Bhairavi Gedam",
    "dob": "01/10/2006"
  },
  {
    "name": "Manali Humane",
    "dob": "25/10/2006"
  },
  {
    "name": "Manthan Suryawanshi",
    "dob": "12/03/2006"
  },
  {
    "name": "Monali Chandanbawane",
    "dob": "18/10/2006"
  },
  {
    "name": "Paresh Nimje",
    "dob": "13/04/2006"
  },
  {
    "name": "Pranjal Madkam",
    "dob": "26/10/2005"
  },
  {
    "name": "Rhutik Kunbhare",
    "dob": "22/03/2006"
  },
  {
    "name": "Sejal Ragit",
    "dob": "28/04/2006"
  },
  {
    "name": "Shrishant Bagale",
    "dob": "06/11/2005"
  },
  {
    "name": "Shrushti Khandare",
    "dob": "25/04/2006"
  },
  {
    "name": "Suhani Chaudhary",
    "dob": "31/05/2006"
  },
  {
    "name": "Vaishnavi Shedala",
    "dob": "05/11/2006"
  },
  {
    "name": "Vedanti Fukat",
    "dob": "18/10/2006"
  },
  {
    "name": "Yash Magare",
    "dob": "02/10/2006"
  },
  {
    "name": "Shraddha Pakhmode",
    "dob": "27/10/2006"
  }
]


  try {
    const result = PreUser.insertMany(preUsersData);
    console.log(`Inserted ${result.length} pre-users.`);
    mongoose.connection.close();
  } catch (err) {
    console.error('Insert error:', err);
    mongoose.connection.close();
  }

*/

module.exports = PreUser;