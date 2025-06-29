var Users = require('../../models/Users');
var Settings = require('../../models/Settings');
var sendMail = require('../../config/mailer')
var logActivity = require('../../utils/log');

const loginPassword = async (req, res) => {
  var { username, password } = req.body;
  username = username.toLowerCase();
  try {
    var user = await Users.findOne({
      $or: [{ email: username }, { username: username }]
    }).select('+code +password');

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    if(!user.verified){
      if(user.email){
        var token = Math.random().toString(36).substring(2) + Date.now().toString(36);
            var expiry = new Date(Date.now() + 1000 * 60 * 30);
        
            var settings = await Settings.findOneAndUpdate(
              { user: user._id },
              { emailVerification: { newEmail: user.email, token, expiry } },
              { new: true, upsert: true }
            );
        
            var link = `${req.protocol}://${req.get('host')}/verify-email/${token}`;
            await sendMail('account_activation', user.email, {link, name: user.name});
            res.json({ success: false, message: 'Your email is not verified. Please check your email for verification link.' });
      } else {
            res.json({ success: false, message: 'Your account doesn\'t have an email. Please contact Ujwal or Prajyot to login to your account.' });
      }
    }

    if(!user.registered) return res.json({ success: false, message: 'Your account is under verification. You will get email shortly!' });

    var isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Incorrect password' });
    }

    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, message: 'Something went wrong' });
      }
      // logActivity(user._id, 'User Login', `Logged in with password.`);
      sendMail('login', user.email, {useragent: req.useragent, method: 'Password'});
      return res.json({ success: true, message: 'Login successful', redirect: '/home' });
    });

  } catch (err) {
    console.log(err)
    res.json({ success: false, message: 'Something went wrong' });
  }

}

module.exports = loginPassword;