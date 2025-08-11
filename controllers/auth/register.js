var Users = require('../../models/Users');
var Settings = require('../../models/Settings');
var sendMail = require('../../config/mailer');
var logActivity = require('../../utils/log');

const register = async (req, res) => {
  var { email, username, name, dob, password } = req.body;
  email = email.toLowerCase();
  try {
    if (!email || !username || !name || !dob || !password) {
        return res.json({ success: false, message: 'All fields are required!' });
    }

    var existingUser = await Users.findOne({ email });
    if (existingUser) return res.json({ success: false, message: 'Email already in use. Login to your account' });

    var existingUsername = await Users.findOne({ username: username.toLowerCase() });
    if (existingUsername) return res.json({ success: false, message: 'Username already taken' });

    const user = await Users.create({
      email, 
      username: username.trim().toLowerCase(),
      name: name.trim(),
      dob: dob.split("-").reverse().join("/"), // Convert to DD/MM/YYYY format
      registered: true,
      verified: true
    });
    user.password = password;
    await user.save();

    await sendMail("new_user_registration", email, { user });
    console.log('✅ Registration credentials sent', email);

    await Settings.create({ user: user._id });

    var admins = await Users.find({ role: 'admin', username: { $ne: '2k17platform'} }, {email:1});
    var adminEmails = admins.map(u => u.email);
    var totalUsers = await Users.countDocuments();
    var verifiedUsers = await Users.countDocuments({ verified: true });
    var registeredUsers = await Users.countDocuments({ registered: true });
    await sendMail('user_registered', adminEmails, { name: user.name, email, username: user.username, totalUsers, verifiedUsers, registeredUsers});

    logActivity(user._id, `${user.name} activated their account`);
    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, message: 'Something went wrong' });
      }
      return res.json({success: true, message: 'Account activated successfully', user , redirect: '/home'});
    })

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = register;