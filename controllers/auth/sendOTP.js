var Users = require('../../models/Users');
var otps = require('../../models/OTP');
var sendMail = require('../../config/mailer');

const sendOTP = async (req, res) => {
  var { email } = req.body;
  try {
    var user = await Users.findOne({ email: email });

    if (!user) {
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