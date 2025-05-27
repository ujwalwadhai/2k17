var Users = require('../../models/Users');
var { destroy } = require('../../config/cloudinary');
var logActivity = require('../../utils/log');

const updateProfile = async (req, res) => {
  try {
    var { username, phone, bio, facebook, linkedin, github, instagram, other } = req.body;
    var update = {
      username, phone, bio,
      socialLinks: {
        facebook,
        linkedin,
        github,
        instagram,
        other
      }
    };

    var userCheck = await Users.findOne({ username });
    if (userCheck && String(userCheck._id) !== String(req.user._id)) {
      return res.json({ success: false, message: 'Username already exists' });
    }

    if (req.file?.path){
      if(req.user.profile) destroy(req.user.profile);
      update.profile = req.file.path;
    }

    await Users.findByIdAndUpdate(req.user._id, update);
    logActivity(req.user._id, 'Profile Update');
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Failed to update profile." });
  }
};

module.exports = updateProfile;