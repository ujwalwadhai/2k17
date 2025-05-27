var Users = require('../../models/Users');
var sendMail = require('../../config/mailer');
var otps = require('../../models/OTP');
var logActivity = require('../../utils/log');


const loginEmail = async (req, res) => {
  var { email, otp } = req.body;

  try {
    var user = await Users.findOne({ email: email });

    if (!user) {
      return res.json({ success: false, message: 'No user with this email found!' });
    }

    var otpRecord = await otps.findOne({ email: email, otp: otp });

    if (!otpRecord) {
      return res.json({ success: false, message: 'Invalid or expired OTP' });
    }

    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, message: 'Something went wrong' });
      }
      logActivity(user._id, 'User Login', `Logged in with email OTP.`);
      sendMail('login', user.email, {useragent: req.useragent, method: 'Email OTP'});
      return res.json({ success: true, message: 'Login successful', redirect: '/home' });
    })

  }
  catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = loginEmail;