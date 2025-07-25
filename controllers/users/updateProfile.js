var Users = require('../../models/Users');
var { destroy } = require('../../config/cloudinary');
var logActivity = require('../../utils/log');

const updateProfile = async (req, res) => {
  try {
    const { username, phone, bio, ...rest } = req.body;

const socialLinks = {};

for (let key in rest) {
  const url = rest[key];
  if (!url || !url.startsWith('http')) continue;

  try {
    const hostname = new URL(url).hostname;
    const domain = hostname.split('.').slice(-2, -1)[0].toLowerCase(); // e.g. 'reddit' from 'u.reddit.com'
    if (domain) {
      socialLinks[domain] = url;
    }
  } catch (e) {
    console.warn(`Invalid URL skipped: ${url}`);
  }
}

const update = {
  username,
  phone,
  bio,
  socialLinks
};

    var userCheck = await Users.findOne({ username });
    if (userCheck && String(userCheck._id) !== String(req.user._id)) {
      return res.json({ success: false, message: 'Username already exists' });
    }

    if (req.file?.path) {
      if (req.user.profile) destroy(req.user.profile);
      update.profile = req.file.path;
    }

    var user = await Users.findOneAndUpdate({_id: req.user._id}, update);
    logActivity(req.user._id, 'Profile Update');
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Failed to update profile." });
  }
};

module.exports = updateProfile;