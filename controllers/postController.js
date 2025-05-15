const bcrypt = require('bcryptjs');
const Users = require('../models/User');
const Files = require('../models/Files');
const otps = require('../models/OTP');
var sendMail = require('../config/mailer');

exports.loginPassword = async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await Users.findOne({
        $or: [{ email: username }, { username: username }]
      });

      if (!user) {
        return res.json({success: false, message:'User not found'});
      }

      const isMatch = await user.validatePassword(password);
      if (!isMatch) {
        return res.json({success: false, message:'Incorrect password'});
      }

      req.login(user, (err) => {
        if (err) {
          console.log(err)
          return res.json({success: false, message:'Something went wrong'});
        }
        return res.json({success: true, message:'Login successful', redirect: '/home'});
      });

    } catch (err) {
      console.log(err);
      res.json({success: false, message:'Something went wrong'});
    }

}

exports.loginEmail = async (req, res) => {
    const { email, otp } = req.body;

    try {
      const user = await Users.findOne({ email: email });

      if (!user) {
        return res.json({success: false, message:'No user with this email found!'});
      }

      const otpRecord = await otps.findOne({ email: email, otp: otp });

      if (!otpRecord) {
        return res.json({success: false, message:'Invalid or expired OTP'});
      }

      req.login(user, (err) => {
        if (err) {
          console.log(err)
          return res.json({success: false, message:'Something went wrong'});
        }
        return res.json({success: true, message:'Login successful', redirect: '/members'});
      })

    }
    catch (err) {
      console.log(err);
      res.json({success: false, message:'Something went wrong'});
    }
}
  
exports.sendOTP = async (req, res) => {
    const { email } = req.body;

    try {
      const user = await Users.findOne({ email: email });

      if (!user) {
        return res.json({success: false, message:'No user with this email found!'});
      }

      const otp = Math.floor(100000 + Math.random() * 900000);

      var otp_temp = `<!DOCTYPE html>
<html lang="en">
<head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f6f9fc;
            padding: 20px;
            color: #333;
          }
          .container {
            background-color: #ffffff;
            max-width: 500px;
            margin: auto;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          .otp {
            font-size: 28px;
            font-weight: bold;
            color: #0056d2;
            margin: 20px 0;
          }
          .footer {
            font-size: 12px;
            color: #888;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Verify your email address</h2>
          <p>Hi there,</p>
          <p>To complete your signup to <strong>2k17</strong>, please enter the following One-Time Password (OTP):</p>
          
          <div class="otp">${otp}</div>

          <p>This OTP is valid for the next 10 minutes. If you didn’t request this, you can ignore this email.</p>

          <p>Thanks,<br/>The 2k17 Team</p>

          <div class="footer">
            Please do not reply to this email. If you have questions, contact us at <a href='mailto:2k17platform@gmail.com'>2k17platform@gmail.com</a>.
          </div>
        </div>
      </body>
      </html>
`

      sendMail(email, "OTP for login at 2k17 platform", otp_temp)
      var newOtp = new otps({
        email: email,
        otp: otp
      });

      await newOtp.save()
      return res.json({success: true, message:'OTP sent successfully'});
    } catch (err) {
      console.log(err);
      res.json({success: false, message:'Something went wrong'});
    }
};

exports.register = async (req, res) => {
  const { username, email, code } = req.body;
  try {
    const user = await Users.findOne({ code });
    if (!user) {
      return res.json({success: false, message:'Invalid code or already registered'});
    }
    const user2 = await Users.findOne({ username: username });
    if (user2) {
      return res.json({success: false, message:'Username already taken'});
    }

    user.username = username;
    user.email = email;
    await user.save();
    req.login(user, (err) => {
        if (err) {
          console.log(err)
          return res.json({success: false, message:'Something went wrong'});
        }
        return res.json({success: true, message:'Registration successful', redirect: '/home'});
    })
  } catch (err) {
    console.log(err);
    res.json({success: false, message:'Something went wrong'});
  }
}

exports.checkUsername = async (req, res) => {
  const { username } = req.body;
  try {
    const user = await Users.findOne({ username: username });
    if (user) {
      return res.json({success: false, message:'Username already taken'});
    }
    return res.json({success: true, message:'Username available'});
  } catch (err) {
    console.log(err);
    res.json({success: false, message:'Something went wrong'});
  }                                                      
}


exports.upload = async (req, res) => {
  const { file } = req;
  if(!file) {
    return res.json({success: false, message:'No file uploaded'});
  }
  try {
    console.log(file)
    const newFile = new Files({
      pid: file.filename,
      url: file.path,
      folder: req.query.folder,
      size: file.size,
      type: file.mimetype
    });
    await newFile.save();
    return res.json({success: true, message:'File uploaded successfully'});
  } catch (err) {
    console.log(err);
    return res.json({success: false, message:'Something went wrong'});
  }
}