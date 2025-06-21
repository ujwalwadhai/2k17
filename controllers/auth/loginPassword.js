var Users = require('../../models/Users');
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

    if(!user.verified) return res.json({ success: false, message: 'Email not verified' });

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