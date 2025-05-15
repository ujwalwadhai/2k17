const nodemailer = require('nodemailer');

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

async function sendMail(to, subject, htmlContent) {
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
    console.error('Error sending email:', error);
    return error;
  }
}

module.exports = sendMail;
