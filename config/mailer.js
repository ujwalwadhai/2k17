// Nodemailer configuration for sending emails

const nodemailer = require('nodemailer');
const Users = require('../models/Users');
const { createDate } = require('../utils/time');
const deviceInfo = require('../middlewares/device');
var logActivity = require('../utils/log')

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

async function sendEmail(to, subject, htmlContent, includeBCC) {
  try {
    var mailOptions = {
      from: '"2k17 Platform" <2k17platform@gmail.com>',
      to,
      subject,
      html: htmlContent,
    };
    if(includeBCC){
      var admins = await Users.find({ role: 'admin' }, {email:1});
      var adminEmails = admins.map(u => u.email);
      mailOptions.bcc = adminEmails;
    }
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
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
  <p style="color:#888; margin-top:20px;">
    Regards,<br>
    2k17 Platform
  </p>
</div>
`
  logActivity('', "Sent Email", `to ${to} for login alert`, {device: deviceInfo(data.useragent), method: data.method})
  sendEmail(to, 'Login Alert • 2k17 Platform', template);
}

async function OTPMail(to, data) {
  var template = `<div style="margin: 0; padding: 0; background-color: #1f1c2e; font-family: sans-serif; color: #ffffffcc;">
    <div style="max-width: 600px; margin: 0 auto; padding: 30px 20px;">
      <div style="background-color: #2b273f; border-radius: 8px; padding: 30px;">
        <h3 style="color: #7b5cf0; margin-top: 0;">OTP for login</h3>
        <p style="margin: 15px 0;">To continue, use the following one-time password:</p>

        <div style="font-size: 28px; font-weight: bold; background-color: #2c283d; color: #ffffffcc; padding: 14px 0; border-radius: 6px; display: inline-block; letter-spacing: 5px; margin: 8px 0;">
          ${data.otp}
        </div>

        <p style="color: #888; font-size: 14px;">
          This code is valid for the next 10 minutes. If you didn’t request this, you can safely ignore this message.<br><br>
          <small>OTP Requested from ${deviceInfo(data.useragent)}</small>
        </p>

        <p style="margin-top: 40px; font-size: 13px; color: #888;">
          Regards,<br>
          2k17 Platform
        </p>
      </div>
    </div>
  </div>`
  logActivity('', "Sent Email", `to ${to} for OTP`, {device: deviceInfo(data.useragent), otp: data.otp})
  sendEmail(to, 'OTP for login • 2k17 Platform', template);
}

async function NewCommentMail(to, data) {
  var template = `<body style="margin: 0; padding: 0; background-color: #1f1c2e; font-family: sans-serif; color: #ffffffcc;">

  <div style="max-width: 600px; margin: 0 auto; padding: 30px 20px;">
    <div style="background-color: #2b273f; border-radius: 8px; padding: 30px;">

      <h3 style="color: #7b5cf0; margin-top: 0;">New comment on your post</h3>

      <p style="margin: 15px 0;">
        <strong style="color: #ffffff;">${data.user.name.split(' ')[0]} ${data.user.name.split(' ')[1][0]}. </strong> commented on your post:
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
        Regards,<br>
        2k17 Platform
      </p>

    </div>
  </div>

</body>`
  logActivity('', "Sent Email", `to ${to} for comment on post`, {postLink: data.postLink})
  sendEmail(to, 'New comment on your post • 2k17 Platform', template, true);
}

async function UserReportMail(to, data) {
  var template = `<div style="font-family: Arial, sans-serif; background-color: #1f1c2e; color: #ffffffcc; padding: 20px;">
    <h3 style="color: #7b5cf0;">We've received your report</h3>
    <p>Hi <strong>${data.name}</strong>,</p>
    <p>Thanks for taking the time to let us know. We've received your report as follows :</p>

    <div style="background-color: #2b273f; padding: 15px; border-left: 4px solid #7b5cf0; margin: 20px 0;">
      <p style="margin-top: 5px; color: #ffffffcc;"><b>Report ID : </b> ${data.reportId}</p>
      <p style="margin-top: 5px; color: #ffffffcc;"><b>Subject : </b> ${data.subject}</p>
      <p style="margin-top: 5px; color: #ffffffcc;"><b>Details : </b> ${data.details}</p>
      <p style="margin-top: 5px; color: #ffffffcc;"><b>Submission Time : </b> ${createDate()}</p>
    </div>

    <p>We'll look into it as soon as possible.</p>
    <p style="color: #888;">
      Regards,<br>
      2k17 Platform
    </p>
  </div>`
  logActivity('', "Sent Email", `to ${to} for report acknowledgement`, {report: data.reportId})
  sendEmail(to, "Report received • 2k17 Platform", template);
}

async function ReportResolvedMail(to, data) {
  var template = `<div style="font-family: Arial, sans-serif; background-color: #1f1c2e; color: #ffffffcc; padding: 20px;">
    <h3 style="color: #7b5cf0;">We've resolved your report</h3>
    <p>Hi <strong>${data.name}</strong>,</p>
    <p>We've resolved your report (id: ${data.reportId}) as follows :</p>

    <div style="background-color: #2b273f; padding: 15px; border-left: 4px solid #7b5cf0; margin: 20px 0;">
      <p style="margin-top: 5px; color: #ffffffcc;"><b>Subject : </b> ${data.subject}</p>
      <p style="margin-top: 5px; color: #ffffffcc;"><b>Details : </b> ${data.details}</p>
      <p style="margin-top: 5px; color: #ffffffcc;"><b>Resolution : </b> ${data.resolution}</p>
    </div>

    <p>You may reply to this email if you're not satisfied with this resolution.</p>
    <p style="color: #888;">
      Regards,<br>
      2k17 Platform
    </p>
  </div>`
  logActivity('', "Sent Email", `to ${to} for report resolution`, {report: data.reportId})
  sendEmail(to, "Report resolved • 2k17 Platform", template);
}

async function AdminReportMail(to, data) {
  var template = `<div style="font-family: Arial, sans-serif; background-color: #1f1c2e; color: #ffffffcc; padding: 20px;">
    <h3 style="color: #7b5cf0;">New Report Submitted</h3>
    <p>A new report has been submitted:</p>

    <div style="background-color: #2b273f; padding: 15px; border-left: 4px solid #7b5cf0; margin: 20px 0;">
      <p><strong>From:</strong> ${data.name || "Anonymous"}</p>
      <p style="margin-top: 5px;"><strong>Subject:</strong> ${data.subject}</p>
      <p style="margin-top: 5px;"><strong>Details:</strong> ${data.details}</p>
      <p style="margin-top: 5px;"><strong>Time:</strong> ${createDate()}</p>
    </div>

    <p style="color: #888;">Login to the <a href="https://twok17.onrender.com/admin">admin dashboard</a> to manage this report.</p>
    <p style="color: #888;">Automated Report System<br>2k17 Platform</p>
  </div>`
  logActivity('', "Sent Email", `to admins for new report`)
  sendEmail(to, "New Report Submitted • 2k17 Platform", template);
}

async function ContactFormMail(to, data) {
  var template = `<div style="font-family: Arial, sans-serif; background-color: #1f1c2e; color: #ffffffcc; padding: 20px;">
    <h3 style="color: #7b5cf0;">Contact Form used</h3>
    <p>Someone submitted the contact form:</p>

    <div style="background-color: #2b273f; padding: 15px; border-left: 4px solid #7b5cf0; margin: 20px 0;">
      <p><strong>From:</strong> ${data.email || "Anonymous"}</p>
      <p style="margin-top: 5px;"><strong>Message:</strong> ${data.text}</p>
      <p style="margin-top: 5px;"><strong>Time:</strong> ${createDate()}</p>
    </div>
    <p style="color: #888;">Automated Report System<br>2k17 Platform</p>
  </div>`
  sendEmail(to, "Contact Form Reachout • 2k17 Platform", template);
}

async function VerifyNewEmailMail(to, data) {
  var template = `<div style="font-family: sans-serif; background: #1f1c2e; color: #ffffffcc; padding: 20px; border-radius: 10px;">
    <h3 style="color: #7b5cf0;">Please Verify Your New Email Address</h3>
    <p>Hello ${data.name || 'there'},</p>
    <p>We received a request to update your email address for your 2k17 account.</p>
    <a href="${data.link}" style="display: inline-block; padding: 10px 20px; background: #7b5cf0; color: white; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
    <p style="margin-top: 20px; color: #888;">
      This link is valid for 30 minutes. If you did not request this change, please ignore this email or contact support.
    </p>
    <p style="color: #888;">
      Regards,<br>
      2k17 Platform
    </p>
  </div>`
  logActivity('', "Sent Email", `to ${to} for email verification`, {VerificationLink: data.link})
  sendEmail(to, 'Verify your new email • 2k17 Platform', template);
}

async function AccountActivationMail(to, data) {
  var template = `<div style="font-family: sans-serif; background: #1f1c2e; color: #ffffffcc; padding: 20px; border-radius: 10px;">
    <h3 style="color: #7b5cf0;">Verify Your Email Address</h3>
    <p>Hello ${data.name || 'there'},</p>
    <p>Welcome to 2k17 Platform ❤️.</p>
    <p>Please verify your email to activate your account.</p>
    <a href="${data.link}" style="display: inline-block; padding: 10px 20px; background: #7b5cf0; color: white; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
    <p style="margin-top: 20px; color: #888; line-height: 24px;">
      This link is valid for 2 days. If you didn't create an account on 2k17 Platform, please ignore this email or reply to this email.
    </p>
    <p style="color: #888; line-height: 24px;">
      Automated Mail System,<br>
      2k17 Platform
    </p>
  </div>`
  logActivity('', "Sent Email", `to ${to} for account activation`, {VerificationLink: data.link})
  sendEmail(to, 'Verify your email • 2k17 Platform', template);
}

async function ResetPasswordMail(to, data) {
  var template = `
        <div style="font-family: sans-serif; background: #1f1c2e; color: #ffffffcc; padding: 20px; border-radius: 10px;">
  <h3 style="color: #7b5cf0;">Link to reset your password</h3>
  <p>Hello ${data.name || 'there'},</p>
  <p>We received a request to reset password of your 2k17 account.</p>
  <p>Please click on button below to set new password</p>
  <a href="${data.link}" style="display: inline-block; padding: 10px 20px; background: #7b5cf0; color: white; text-decoration: none; border-radius: 5px;">Reset password</a>
  <p style="margin-top: 20px; color: #888;">
    This link is valid for 1 hour. If you did not request this change, please ignore this email or contact support.
  </p>
  <p style="color: #888;">
    Regards,<br>
    2k17 Platform
  </p>
</div>

      `
  logActivity('', "Sent Email", `to ${to} for password reset link`, {resetLink: data.link})
  sendEmail(to, 'Password reset link • 2k17 Platform', template);
}

async function BirthdayMail(to, data) {
  var template = `<div style="font-family: sans-serif; background: #1f1c2e; color: #ffffffcc; padding: 20px; border-radius: 10px; line-height: 25px; max-width: 600px; margin: auto;">
  <h3 style="color: #7b5cf0;">🎂 Happy Birthday, ${data.name || 'Friend'}!</h3>

  <p>Today’s your day – and you’re officially in the spotlight on <b><a href="https://twok17.onrender.com/" target="_blank">2k17 Platform</a></b>! You are featured on our website on this special day. 🥳</p>

  <p>Drop a post, share the vibes, or just soak in the birthday wishes from your batchmates. We’re glad you’re part of this journey!</p>

  <p>Wishing you an amazing year ahead. 🎈</p>

  <a href="https://twok17.onrender.com/#birthday-spotlight" target="_blank" style="display: inline-block; margin: 10px 0; padding: 10px 20px; background: #7b5cf0; color: white; text-decoration: none; border-radius: 5px;">Visit 2k17 Platform</a>

  <p style="color: #888; margin-top: 12px; margin-bottom:6px">Ujwal W. and Prajyot R.</p><p style="color: #888; margin-top:0; padding-top:0; margin-bottom: 4px">2k17 Platform</p>
</div>`
  logActivity('', "Sent Email", `to ${to} for birthday wish`)
  sendEmail(to, 'Happy Birthday 🎂 • 2k17 Platform', template);
}

async function NewsLetterPreviewMail(to, data) {
  var template = `<p>Scheduled at ${data.scheduledAt}</p><br>${data.content}`
  logActivity('', "Sent Email", `to admins for ${data.title} preview`)
  sendEmail(to, `${data.title} Preview • 2k17 Platform`, template);
}

async function NewsLetterMail(to, data) {
  logActivity('', "Sent Email", `to everyone for ${data.title}`)
  sendEmail(to, `${data.title} • 2k17 Platform`, data.content);
}

async function NewsLetterSubscribeMail(to, data) {
  var template = `<div style="font-family: sans-serif; background: #1f1c2e; color: #ffffffcc; padding: 20px; border-radius: 10px;">
              <h3 style="color: #7b5cf0;">Newsletter subscription</h3>
              <p>${data.email} subscribed to our newsletter.</p>
              <p style="color: #888;">Ujwal W.</p><p style="color: #888;">2k17 Platform</p>
            </div>`
  sendEmail(to, 'Newsletter subscription • 2k17 Platform', template);
}

async function UserRegisteredMail(to, data) {
  var template = `<div style="font-family: sans-serif; background: #1f1c2e; color: #ffffffcc; padding: 20px; border-radius: 10px;">
              <h3 style="color: #7b5cf0;">New User Registration</h3>
              <p>A new user has registered just now with details as follows:</p>
              <div style="background-color: #2b273f; padding: 10px 15px; border-left: 4px solid #7b5cf0; margin: 20px 0;">
                <p><strong>Name:</strong> ${data.name || "<Name not specified>"}</p>
                <p style="margin-top: 5px;"><strong>Username:</strong> ${data.username}</p>
                <p style="margin-top: 5px;"><strong>Email:</strong> ${data.email}</p>
                <p style="margin-top: 5px;"><a href="https://twok17.onrender.com/admin/users" style="font-weight: bold; text-decoration: none;" target="_blank">Open admin dashboard</a> to approve this user</p>
                <br>
                <p>The current user stats are as follows :</p>
                <p><strong>Total users:</strong> ${data.totalUsers}</p>
                <p style="margin-top: 5px;"><strong>Verified users:</strong> ${data.verifiedUsers}</p>
                <p style="margin-top: 5px;"><strong>Registered users:</strong> ${data.registeredUsers}</p>
              </div>
              <p style="color: #888;">Automated Mail System</p><p style="color: #888;">2k17 Platform</p>
            </div>`
  sendEmail(to, 'New user registration • 2k17 Platform', template);
}

async function RegisteredDataMail(to, data) {
  var template = `<div style="font-family: sans-serif; background: #1f1c2e; color: #ffffffcc; padding: 20px; border-radius: 10px;">
              <h2 style="color: #7b5cf0;">Welcome to 2k17 Platform ❤️</h2>
              <p>Hey ${data.user?.name?.trim().split(' ')[0] || 'there'},</p>
              <p>We sincerely thank you for registering on 2k17 Platform.</p>
              <p>This are details we have stored to your account:</p>
              <div style="background-color: #2b273f; padding: 12px 10px; border-left: 4px solid #7b5cf0; margin: 20px 0;">
                <p><strong>Name:</strong> ${data.user.name || "<Name not specified>"}</p>
                <p style="margin-top: 5px;"><strong>Username:</strong> ${data.user.username}</p>
                <p style="margin-top: 5px;"><strong>Password:</strong> Saved as hash password</p>
                <small>We use industry-standard hashing (bcryptjs) to protect your password. This means no one can know your actual password, not even Ujwal and Prajyot.</small>
              </div><br>
              <a href="https://twok17.onrender.com/" style="padding:10px 20px; background:#7b5cf0; color:white; text-decoration:none; border-radius:4px;">Visit Platform</a><br><br>
              <p style="color: #888;">Automated Mail System</p><p style="color: #888;">2k17 Platform</p>
              </div>`
  sendEmail(to, "Welcome to 2k17 Platform ❤️", template);
}

async function sendMail(type, to, data) {
  if (type == 'otp') OTPMail(to, data);
  // if (type == 'login') LoginMail(to, data);
  if (type == 'report_user') UserReportMail(to, data);
  if (type == 'report_admins') AdminReportMail(to, data);
  if (type == 'verify-new-email') VerifyNewEmailMail(to, data);
  if (type == 'reset-password') ResetPasswordMail(to, data);
  if (type == 'newcomment') NewCommentMail(to, data); 
  if (type == 'report_resolved') ReportResolvedMail(to, data); 
  if (type == 'birthday') BirthdayMail(to, data); 
  if (type == 'account_activation') AccountActivationMail(to, data); 
  if (type == 'contact_form') ContactFormMail(to, data); 
  if (type == 'newsletter_preview') NewsLetterPreviewMail(to, data); 
  if (type == 'newsletter') NewsLetterMail(to, data); 
  if (type == 'newsletter_subscribe') NewsLetterSubscribeMail(to, data); 
  if (type == 'user_registered') UserRegisteredMail(to, data); 
  if (type == 'new_user_registration') RegisteredDataMail(to, data); 
}

module.exports = sendMail;
 