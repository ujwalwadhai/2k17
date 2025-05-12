const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

async function sendMail(to, subject, htmlContent) {
  try {
    const mailOptions = {
      from: '"2k17 App" <2k17platform@gmail.com>', // can be anything, even if you don’t own the domain
      to,
      subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// sendMail('ujwalwadhai@gmail.com', 'Test Email', '<h1>Hello World!</h1>')

module.exports = sendMail;
