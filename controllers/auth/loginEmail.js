var Users = require('../../models/Users');
var Settings = require('../../models/Settings');
var sendMail = require('../../config/mailer');
var otps = require('../../models/OTP');
var logActivity = require('../../utils/log');
var deviceInfo = require('../../middlewares/device')

const loginEmail = async (req, res) => {
  var { email, otp } = req.body;

  try {
    var user = await Users.findOne({ email: email });

    if (!user) {
      return res.json({ success: false, message: 'No user with this email found' });
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
                return res.json({ success: false, message: 'Your email is not verified. Please check your email for verification link.' });
          } else {
                return res.json({ success: false, message: 'Your account doesn\'t have an email. Please contact Ujwal or Prajyot to login to your account.' });
          }
        }

    if(!user.registered) return res.json({ success: false, message: 'Your account is under verification. You will get email shortly!' });

    var otpRecord = await otps.findOne({ email: email, otp: otp });

    if (!otpRecord) {
      return res.json({ success: false, message: 'Invalid or expired OTP' });
    }

    req.login(user, async (err) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, message: 'Something went wrong' });
      }
      req.session.device = deviceInfo(req.useragent);
      req.session.method = 'email';
      logActivity(user._id, `Logged in with email OTP.`);
      sendMail('login', user.email, {useragent: req.useragent, method: 'Email OTP'});
      await Users.findOneAndUpdate({ email: email }, { lastLogin: Date.now() }, { new: true });
      await otps.deleteMany({ email: email })
      return res.json({ success: true, message: 'Login successful', redirect: '/home' });
    })

  }
  catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = loginEmail;