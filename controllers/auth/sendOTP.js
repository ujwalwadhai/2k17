var Users = require('../../models/Users');
var Settings = require('../../models/Settings');
var otps = require('../../models/OTP');
var sendMail = require('../../config/mailer');

const sendOTP = async (req, res) => {
  var { email } = req.body;
  try {
    var user = await Users.findOne({ email: email });

    if (!user) { 
      var user2 = await Settings.findOne({ 'emailVerification.newEmail': email });
      if(user2) return res.json({ success: false, message: 'Email not verified' });
      return res.json({ success: false, message: 'No user with this email found!' });
    }

    var otp = Math.floor(100000 + Math.random() * 900000);

    sendMail('otp', email, {otp, useragent: req.useragent});
    var newOtp = new otps({
      email: email,
      otp: otp
    });

    await newOtp.save()
    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Something went wrong' });
  }
};

module.exports = sendOTP;