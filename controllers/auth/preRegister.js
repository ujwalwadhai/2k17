var Users = require('../../models/Users');
var Settings = require('../../models/Settings');
var sendMail = require('../../config/mailer');
var logActivity = require('../../utils/log');
var getCode = require('../../utils/randomCode');

const preRegister = async (req, res) => {
  var { email, username, name, dob } = req.body;
  email = email.toLowerCase();
  try {
    if (!email || !username || !name || !dob) {
        return res.json({ success: false, message: 'All fields are required!' });
    }

    var existingUser = await Users.findOne({ email });
    if (existingUser) return res.json({ success: false, message: 'Email already registered' });

    var existingUsername = await Users.findOne({ username: username.toLowerCase() });
    if (existingUsername) return res.json({ success: false, message: 'Username already taken' });

    const user = await Users.create({
      email,
      username: username.toLowerCase(),
      name: name.trim(),
      dob: dob.split("-").reverse().join("/"), // Convert to DD/MM/YYYY format
      registered: false,
      verified: false,
      code: getCode(name),
    });

    await user.save();

    var token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    var expiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);

    await Settings.findOneAndUpdate(
      { user: user._id },
      { emailVerification: { newEmail:email, token, expiry } },
      { new: true, upsert: true } 
    );

    var link = `${req.protocol}://${req.get('host')}/verify-email/${token}`;

    await sendMail('account_activation', email, { name: user.name, link }); 
    var admins = await Users.find({ role: 'admin' }, {email:1});
    var adminEmails = admins.map(u => u.email);
    var totalUsers = await Users.countDocuments();
    var verifiedUsers = await Users.countDocuments({ verified: true });
    var registeredUsers = await Users.countDocuments({ registered: true });
    await sendMail('user_registered', adminEmails, { name: user.name, email, username: user.username, totalUsers, verifiedUsers, registeredUsers});

    logActivity(user._id, 'Account Activation', `${user.name} activated their account`);
    return res.json({ success: true, message: 'Please check your email (spam folder too) to verify your account', redirect: '/' });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = preRegister;