const nodemailer = require('nodemailer');
const { createDate } = require('../utils/dateFunctions');
const deviceInfo = require('../middlewares/device');

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

async function sendEmail(to, subject, htmlContent) {
  try {
    const mailOptions = {
      from: '"2k17 Platform" <2k17platform@gmail.com>',
      to,
      subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

async function LoginMail(to, data) {
  var template = `<div style="background-color:#1f1c2e; color:#ffffffcc; font-family:sans-serif; padding:20px;">
  <h3 style="color:#7b5cf0;">Security Alert</h3>
  <p>Someone logged in to your account recently. If this wasn’t you, please <a href="" style="color:#7b5cf0;">change your password</a> immediately.</p>
  <div style="margin-top:20px; padding:10px; background-color:#2b273f; border-left:4px solid #6342d8;">
    <p style="margin:0;">Browser: ${deviceInfo(data.useragent)}</p>
    <p style="margin:0;">Authentication Method: ${data.method}</p>
    <p style="margin:0;">Time: ${createDate()}</p>
  </div>
  <p style="color:#888; margin-top:20px;">Regards,<br>Ujwal W.<br>2k17 Platform</p>
</div>
`
  sendEmail(to, 'Login Alert • 2k17 Platform', template);
}

async function OTPMail(to, data) {
  var template = `<div style="margin: 0; padding: 0; background-color: #1f1c2e; font-family: sans-serif; color: #ffffffcc;">
    <div style="max-width: 600px; margin: 0 auto; padding: 30px 20px;">
      <div style="background-color: #2b273f; border-radius: 8px; padding: 30px;">
        <h3 style="color: #7b5cf0; margin-top: 0;">Verify Your Email</h3>
        <p style="margin: 15px 0;">To continue, use the following one-time password:</p>

        <div style="font-size: 28px; font-weight: bold; background-color: #2c283d; color: #ffffffcc; padding: 14px 0; border-radius: 6px; display: inline-block; letter-spacing: 5px; margin: 8px 0;">
          ${data.otp}
        </div>

        <p style="color: #888; font-size: 14px;">
          This code is valid for the next 10 minutes. If you didn’t request this, you can safely ignore this message.<br><br>
          <small>OTP Requested from ${deviceInfo(data.useragent)}</small>
        </p>

        <p style="margin-top: 40px; font-size: 13px; color: #888;">
          Regards,<br>Ujwal W.<br>2k17 Platform
        </p>
      </div>
    </div>
  </div>`

  sendEmail(to, 'OTP for login • 2k17 Platform', template);
}

async function NewCommentMail(to, data) {
  var template = `<body style="margin: 0; padding: 0; background-color: #1f1c2e; font-family: sans-serif; color: #ffffffcc;">

  <div style="max-width: 600px; margin: 0 auto; padding: 30px 20px;">
    <div style="background-color: #2b273f; border-radius: 8px; padding: 30px;">

      <h3 style="color: #7b5cf0; margin-top: 0;">New comment on your post</h3>

      <p style="margin: 15px 0;">
        <strong style="color: #ffffff;">${data.user.username} (${data.user.name.split(' ')[0]} ${data.user.name.split(' ')[1][0]}.)</strong> commented on your post:
      </p>

      <div style="background-color: #2c283d; padding: 12px; border-left: 4px solid #7b5cf0; border-radius: 4px; margin: 12px 0; color: #ffffffcc;">
        “${data.comment}”
      </div>

      <a href="${data.postLink}" style="display: inline-block; margin-top: 20px; padding: 10px 18px; background-color: #7b5cf0; color: white; text-decoration: none; border-radius: 5px; font-size: 15px;">
        View Post
      </a>

      <p style="color: #888; font-size: 14px; margin-top: 40px;">
        You’re receiving this because you posted on 2k17 Platform.
      </p>

      <p style="font-size: 14px; color: #888; line-height: 21px;">
        Regards,<br>Ujwal W.<br>2k17 Platform
      </p>

    </div>
  </div>

</body>`

  sendEmail(to, 'New comment on your post • 2k17 Platform', template);
}

async function sendMail(type, to, data) {
  /* if (type == 'login') LoginMail(to, data);
  if (type == 'otp') OTPMail(to, data);
  if (type == 'newcomment') NewCommentMail(to, data); // stopped to avoid sending emails during development */
}

module.exports = sendMail;
