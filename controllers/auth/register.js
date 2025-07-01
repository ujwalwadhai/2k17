var Users = require('../../models/Users');
var Settings = require('../../models/Settings');
var sendMail = require('../../config/mailer');
var logActivity = require('../../utils/log');

const register = async (req, res) => {
  var { email, code } = req.body;
  email = email.toLowerCase();
  try {
    var user = await Users.findOne({ code });
    if (!user) {
      return res.json({ success: false, message: 'Invalid activation code!' });
    }

    if (user.registered) {
      return res.json({ success: false, message: 'You are already registered! Please login to continue' });
    }

    var user2 = await Users.findOne({ email });
    if (user2) {
      return res.json({ success: false, message: 'Email already registered' });
    }

    user.email = email;
    user.registered = true;
    user.verified = false;
    await user.save();

    var token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    var expiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);

    await Settings.findOneAndUpdate(
      { user: user._id },
      { emailVerification: { newEmail: email, token, expiry } },
      { new: true, upsert: true }
    );

    var link = `${req.protocol}://${req.get('host')}/verify-email/${token}`;

    await sendMail('account_activation', email, { name: user.name, link });
    var admins = await Users.find({ role: 'admin' }, { email: 1 });
    var adminEmails = admins.map(u => u.email);
    var totalUsers = await Users.countDocuments();
    var verifiedUsers = await Users.countDocuments({ verified: true });
    var registeredUsers = await Users.countDocuments({ registered: true });
    await sendMail('user_registered', adminEmails, { name: user.name, email, username: user.username, totalUsers, verifiedUsers, registeredUsers });

    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, message: 'Something went wrong' });
      }
      logActivity(user._id, 'Account Activation', `${user.name} activated their account`);
      return res.json({ success: true, message: 'Please check your email (spam folder too) to verify your account', redirect: '/home?onboarding=true' });
    })
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = register;