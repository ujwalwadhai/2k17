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

    var existingOTP = await otps.findOne({ email });
    var otp = existingOTP?.otp ?? Math.floor(1000 + Math.random() * 9000);

    var newOtp = new otps({
      email,
      otp
    });
    sendMail('otp', email, {otp, useragent: req.useragent});

    await newOtp.save()
    return res.json({ success: true, message: `OTP ${existingOTP ? 're' : ''}sent successfully` });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Something went wrong' });
  }
};

module.exports = sendOTP;