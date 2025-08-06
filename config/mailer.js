// Nodemailer configuration for sending emails

const nodemailer = require('nodemailer');
const Users = require('../models/Users');
const { createDate, createLongDate } = require('../utils/time');
const deviceInfo = require('../middlewares/device');
var logActivity = require('../utils/log')
const dotenv = require('dotenv');
dotenv.config();

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
    const adminEmails = [process.env.UJWAL_EMAIL, process.env.PRAJYOT_EMAIL]

    var mailOptions = {
      from: '"2k17 Platform" <2k17platform@gmail.com>',
      to,
      subject,
      html: htmlContent,
    };

    let shouldSendEmail = true;

    if (process.env.PLATFORM_TYPE == 'developement') {
      if (!adminEmails.includes(to)) {
        // Don't send email if 'to' is not admin
        shouldSendEmail = false;
        console.log(`[DEVELOPMENT MODE] Suppressed email to non-admin in developement: ${to}`);
      }
    }

    if (includeBCC) {
      mailOptions.bcc = adminEmails;
    }
    if (shouldSendEmail) await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
}

function createEmailTemplate(mainContent) {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato&display=swap" rel="stylesheet">
    <title>Security Alert</title>
    <style>
        html,
        body {
            margin: 0;
            padding: 0;
            background-color: #1f1c2e;
            background: #1f1c2e;
            font-family: 'Lato', Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .container {
            max-width: 580px;
            margin: 20px auto;
            margin-top: 0;
            background-color: #252236;
            border-radius: 8px;
            overflow: hidden;
        }

        @media (min-width: 581px) {
            .container {
                margin-top: 36px;
            }
        }

        .navbar-table {
            width: 100%;
            padding: 18px 30px 16px 28px;
            border-bottom: 1px solid #3e3a50;
        }
        .navbar-brand a, .navbar-logo a {
            display: inline-block;
            vertical-align: middle;
            text-decoration: none;
        }
        .navbar-brand img {
            width: 32px;
            height: 32px;
            background-color: #7b5cf0;
            border-radius: 4px;
            vertical-align: middle;
            margin-right: 12px;
        }
        .navbar-brand p {
            display: inline-block;
            vertical-align: middle;
            margin: 0;
            font-size: 18px;
            font-weight: bold;
            color: white;
        }
        .navbar-link a {
            color: #9e9e9e;
            text-decoration: none;
            font-size: 16px;
            font-weight: 600;
        }
        .navbar-link a:hover {
            color: #ffffff;
        }
        .navbar-logo{
            width: 32px;
            padding-right: 12px;
            padding-top: 0;
        }
        .navbar-logo .logo {
            padding: 6px 4px 0;
            margin: 0;
            width: 28px;
            height: 30px;
            border-radius: 4px;
            background-color: #1a1924;
            text-align: center;
        }
        .navbar-logo .logo .logo-top {
            font-size: 11.5px;
            color: #7b5cf0;
            margin: 0;
            font-weight: 600;
        }
        .navbar-logo .logo .logo-bottom {
            font-size: 4px;
            color: #7b5cf0;
            margin: 0;
        }

        .content {
            padding: 20px 30px 30px 30px;
        }

        @media (max-width: 600px){
            .navbar-table{
                padding: 18px 20px 16px 16px;
            }

            .navbar-logo .logo .logo-bottom{
                display: none;
            }
            .navbar-logo .logo{
                padding-top: 12px;
                height: 24px;
            }

            .content{
                padding: 20px 20px 30px 20px;
            }
        }

        .content h2 {
            margin: 4px 0 16px 0;
            font-size: 20px;
            font-weight: 600;
        }
        .content p {
            color: #ffffff;
            font-size: 16px;
            line-height: 1.6;
            margin: 0;
        }
        .content a {
            color: #7b5cf0;
            font-weight: 500;
            text-decoration: underline;
            margin: 0 2px;
        }
        .info-box {
            padding: 14px 20px;
            background-color: #332f48;
            border-left: 4px solid #6342d8;
            border-radius: 4px;
            color: #ffffff;
            font-size: 14px;
        }
        .info-box p {
            font-size: 14px;
            line-height: 2.1;
            margin: 0;
        }
        .info-box p:last-child { margin-bottom: 0; }
        .info-box strong {
            color: #9e9e9e;
            font-weight: 400;
            margin-right: 8px;
        }

        .footer {
            padding: 30px 30px 0 30px;
            text-align: center;
        }
        .footer p {
            color: #9e9e9e;
            font-size: 13px;
            line-height: 1.7;
            margin: 0;
        }
        .footer-links {
            margin-top: 12px;
        }
        .footer-links a {
            font-size: 13px;
            text-decoration: none;
            color: #9e9e9e;
        }
    </style>
</head>

<body>
    <div class="container">
        <table class="navbar-table" border="0" cellpadding="0" cellspacing="0">
            <tr>
                <td class="navbar-logo" valign="middle">
                    <a href="https://twok17.onrender.com/" target="_blank">
                        <div class="logo"><p class="logo-top">2k17</p><p class="logo-bottom">PLATFORM</p></div>
                    </a>
                </td>
                <td class="navbar-brand" valign="middle">
                    <a href="https://twok17.onrender.com/" target="_blank">
                        <p>2k17 Platform</p>
                    </a>
                </td>
                <td class="navbar-link" valign="middle" align="right">
                    <a href="https://twok17.onrender.com/home" target="_blank">Home</a>
                </td>
            </tr>
        </table>

        <div class="content">
            ${mainContent}
            <div class="footer">
                <p>Regards, Ujwal W. and Prajyot R.<br>2k17 Platform</p>
                <p class="footer-links">
                    <a href="mailto:2k17%20Platform<2k17platform@gmail.com>?cc=Ujwal%20W.<wadhaiujwal@gmail.com>,Prajyot%20R.<prajyotraut77@gmail.com>&subject=Feedback%20to%202k17%20Platform">Contact us</a>
                    &nbsp;|&nbsp;
                    <a href="https://twok17.onrender.com/members">Members</a>
                    &nbsp;|&nbsp;
                    <a href="https://twok17.onrender.com/memories">Memories</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;

  return template;
}

async function LoginMail(to, data) {
  let content = `
    <h2 style="color: #ffcc00;">Security Alert</h2>
    <p>We detected a new login to your 2k17 Platform account. If this was you, you can safely disregard this email.</p>
    <p style="margin: 20px 0">If you don't recognize this activity, please <a href="https://twok17.onrender.com/settings" target="_blank">change your password</a> immediately.</p>
    <div class="info-box">
      <p><strong>Browser:</strong>${deviceInfo(data.useragent)}</p>
      <p><strong>Method:</strong>${data.method}</p>
      <p><strong>Time:</strong>${createLongDate()}</p>
    </div>`;

  logActivity('', `Sent email to ${to} for login alert`, { device: deviceInfo(data.useragent), method: data.method })
  sendEmail(to, 'Login Alert • 2k17 Platform', createEmailTemplate(content));
}

async function OTPMail(to, data) {
  let content = `
        <h2 style="color: #7b5cf0">OTP for Login</h2>
        <p>To login, please use the following one time password:</p>
        <div style="font-size: 22px; font-weight: bold; color: #ffffffcc; padding: 14px 0; border-radius: 6px; display: inline-block; letter-spacing: 5px; margin: 8px 0;">
          ${data.otp}
        </div>

        <p style="color: #888; font-size: 14px;">
          This code is valid for the next 10 minutes. If you didn’t request this, you can safely ignore this message.<br><br>
          OTP Requested from ${deviceInfo(data.useragent)}
        </p>`
  logActivity('', `Sent email to ${to} for login OTP`, { device: deviceInfo(data.useragent), otp: data.otp })
  sendEmail(to, `OTP for login ${data.otp} • 2k17 Platform`, createEmailTemplate(content));
}

async function AppErrorAlert(to, data) {
  let content = `
    <h2 style="color: #7b5cf0">Server Error Alert</h2>
      <p>Hi <strong>Admin</strong>,</p>
      <p style="margin-bottom: 12px">A critical error was caught by the application's global error handler as follows:</p>

      <div class="info-box">
        <p><strong>Error Time:</strong> ${data.errorTime}</p>
        <p><strong>Request URL:</strong> ${data.req.method} ${data.req.originalUrl}</p>
        <p><strong>Error Message:</strong> ${data.errorMessage}</p>
      </div>

      <h3 style="margin-top: 24px; color: white;">Shortened Stack Trace:</h3>
      <pre class="stack-trace" style="background-color: #2b2b2b; color: #f1f1f1; padding: 15px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; font-family: monospace;"><code>${data.errorData}</code></pre>`

  logActivity('', `Sent email to admins for error alert`)
  console.log("ERROR EMAIL SENT TO ADMINS")
  sendEmail(to, "⚠️ App error alert • 2k17 Platform", createEmailTemplate(content));
}

async function UserReportMail(to, data) {
  let content = `
    <h2 style="color: #7b5cf0;">Report Received</h2>
    <p>Hi <strong>${data.name}</strong>,</p>
    <p style="margin-bottom: 16px;">Thanks for taking the time to let us know. We've received your report as follows :</p>

    <div class="info-box">
      <p><strong>Report ID:</strong>${data.reportId}</p>
      <p><strong>Subject:</strong>${data.subject}</p>
      <p><strong>Details:</strong>${data.details}</p>
      <p><strong>Time:</strong>${createLongDate()}</p>
    </div>

    <p style="margin-top: 16px;">We'll look into it as soon as possible.</p>`

  logActivity('', `Sent email to ${to} for report acknowledgement`, { report: data.reportId })
  sendEmail(to, "Report received • 2k17 Platform", createEmailTemplate(content));
}

async function ReportResolvedMail(to, data) {
  let content = `
    <h2 style="color: #7b5cf0;">Report Resolved</h2>
    <p>Hi <strong>${data.name}</strong>,</p>
    <p style="margin-bottom: 16px;">We've resolved your report (id: ${data.reportId}) as follows :</p>

    <div class="info-box">
      <p><strong>Subject:</strong>${data.subject}</p>
      <p><strong>Details:</strong>${data.details}</p>
      <p><strong>Resolution:</strong>${data.resolution}</p>
    </div>

    <p style="margin-top: 16px;">You may reply to this email if you're not satisfied with this resolution.</p>`

  logActivity('', `Sent email to ${to} for report resolution`, { report: data.reportId })
  sendEmail(to, "Report resolved • 2k17 Platform", createEmailTemplate(content));
}

async function AdminReportMail(to, data) {
  let content = `
    <h2 style="color: #7b5cf0;">New Report Submitted</h2>
    <p style="margin-bottom: 16px">A new report has been submitted as follows:</p>

    <div class="info-box">
      <p><strong>From:</strong>${data.name || "Anonymous"}</p>
      <p><strong>Subject:</strong>${data.subject}</p>
      <p><strong>Details:</strong>${data.details}</p>
      <p><strong>Time:</strong>${createLongDate()}</p>
    </div>

    <p style="color: #888; margin-top: 16px">Open the <a href="https://twok17.onrender.com/admin">admin dashboard</a> to manage this report.</p>`

  logActivity('', `Sent email to admins for new report`)
  sendEmail(to, "New Report Submitted • 2k17 Platform", createEmailTemplate(content));
}

async function ContactFormMail(to, data) {
  let content = `
    <h2 style="color: #7b5cf0;">Contact Form</h2>
    <p style="margin-bottom: 16px;">Someone submitted the contact form as follows:</p>

    <div class="info-box">
      <p><strong>From:</strong>${data.email || "Anonymous"}</p>
      <p><strong>Message:</strong>${data.text}</p>
      <p><strong>Time:</strong>${createLongDate()}</p>
    </div>`

  sendEmail(to, "Contact Form Reachout • 2k17 Platform", createEmailTemplate(content));
}

async function VerifyNewEmailMail(to, data) {
  let content = `
    <h2 style="color: #7b5cf0;">Verify New Email</h2>
    <p>Hello ${data.name || 'there'},</p>
    <p style="margin-bottom: 16px;">We received a request to update your email address for your 2k17 account.</p>
    <a href="${data.link}" style="display: inline-block; padding: 10px 20px; background: #7b5cf0; color: white; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
    <p style="margin-top: 16px; color: #888;">
      This link is valid for 30 minutes. If you did not request this change, please ignore this email or reply to this email.
    </p>`
  logActivity('', `Sent email to ${to} for email verification`, { VerificationLink: data.link })
  sendEmail(to, 'Verify your new email • 2k17 Platform', createEmailTemplate(content));
}

async function AccountActivationMail(to, data) {
  let content = `
    <h2 style="color: #7b5cf0;">Verify Email Address</h2>
    <p>Hello ${data.name || 'there'},</p>
    <p style="margin-bottom: 16px;">Welcome to 2k17 Platform ❤️.</p>
    <p style="margin-bottom: 16px;">Please verify your email to activate your account.</p>
    <a href="${data.link}" style="display: inline-block; padding: 10px 20px; background: #7b5cf0; color: white; text-decoration: none; border-radius: 5px;">Verify Email Address</a>
    <p style="margin-top: 16px; color: #888; line-height: 24px;">
      This link is valid for 2 days. If you didn't create an account on 2k17 Platform, please ignore this email or reply to this email.
    </p>`

  logActivity('', `Sent email to ${to} for account activation`, { VerificationLink: data.link })
  sendEmail(to, 'Verify your email • 2k17 Platform', createEmailTemplate(content));
}

async function ResetPasswordMail(to, data) {
  let content = `
    <h2 style="color: #7b5cf0;">Reset Password</h2>
    <p>Hello ${data.name || 'there'},</p>
    <p style="margin-bottom: 16px;">We received a request to reset password of your 2k17 Platform account.</p>
    <p style="margin-bottom: 16px;">Please click on button below to set new password:</p>
    <a href="${data.link}" style="display: inline-block; padding: 10px 20px; background: #7b5cf0; color: white; text-decoration: none; border-radius: 5px;">Reset password</a>
    <p style="margin-top: 16px; color: #888;">
      This link is valid for 1 hour. If you did not request this change, please ignore this email or reply to this email.
    </p>`

  logActivity('', `Sent email to ${to} for password reset link`, { resetLink: data.link })
  sendEmail(to, 'Password reset link • 2k17 Platform', createEmailTemplate(content));
}

async function BirthdayMail(to, data) {
  let content = `
  <h2 style="color: #7b5cf0;">🎂 Happy Birthday, ${data.name || 'Friend'}!</h2>

  <p style="margin-bottom: 16px;">Today’s your day – and you’re officially in the spotlight on <b><a href="https://twok17.onrender.com/" target="_blank">2k17 Platform</a></b>! You are featured on our website on this special day. 🥳</p>

  <p>Drop a post, share the vibes, or just soak in the birthday wishes from your batchmates. We’re glad you’re part of this journey!</p>

  <p style="margin-bottom: 16px;">Wishing you an amazing year ahead. 🎈</p>

  <a href="https://twok17.onrender.com/#birthday-spotlight" target="_blank" style="display: inline-block; margin: 10px 0; padding: 10px 20px; background: #7b5cf0; color: white; text-decoration: none; border-radius: 5px;">Visit 2k17 Platform</a>`

  logActivity('', `Sent email to ${to} for birthday wish`)
  sendEmail(to, 'Happy Birthday 🎂 • 2k17 Platform', createEmailTemplate(content));
}

async function NewsLetterPreviewMail(to, data) {
  var template = `<p>Scheduled at ${data.scheduledAt}</p><br>${data.content}`
  logActivity('', `Sent email to admins for ${data.title} preview`)
  sendEmail(to, `${data.title} Preview • 2k17 Platform`, template);
}

async function NewsLetterMail(to, data) {
  logActivity('', `Sent email to everyone for ${data.title}`)
  sendEmail(to, `${data.title} • 2k17 Platform`, data.content);
}

async function NewsLetterSubscribeMail(to, data) {
  let content = `
    <h2 style="color: #7b5cf0;">Newsletter Subscription</h2>
    <p>Hello Admin,</p>
    <p>${data.email} subscribed to our newsletter.</p>`

  sendEmail(to, 'Newsletter subscription • 2k17 Platform', createEmailTemplate(content));
}

async function PostMentionMail(to, data) {
  let content = `
    <h2 style="color: #7b5cf0;">Post Mention</h2>
    <p style="margin-bottom: 8px;">Hello, ${data.name || 'there'}</p>
    <p style="margin-bottom: 16px;"><a href="https://twok17.onrender.com/${data.username}">${data.username}</a> mentioned you in their post.</p>
    <a href="${data.url}" target="_blank" style="display: inline-block; margin: 10px 0; padding: 10px 20px; background: #7b5cf0; color: white; text-decoration: none; border-radius: 5px;">See post</a>`

  logActivity('', `Sent email for post mention`)
  sendEmail(to, 'Post mention • 2k17 Platform', createEmailTemplate(content));
}

async function UserRegisteredMail(to, data) {
  let content = `
    <h2 style="color: #7b5cf0;">New User Registration</h2>
    <p style="margin-bottom: 16px;">A new user has registered just now with details as follows:</p>
    <div class="info-box">
      <p><strong>Name:</strong>${data.name || "<Name not specified>"}</p>
      <p><strong>Username:</strong>${data.username}</p>
      <p><strong>Email:</strong>${data.email}</p>
      ${data.method ? `<p><strong>Method:</strong>${data.method}</p>` : ''}
      <p><a href="https://twok17.onrender.com/admin/users" style="font-weight: bold; text-decoration: none;" target="_blank">Open admin dashboard</a> to approve this user</p>
      <br>
      <p>The current user stats are as follows:</p>
      <p><strong>Total users:</strong>${data.totalUsers}</p>
      <p><strong>Verified users:</strong>${data.verifiedUsers}</p>
      <p><strong>Registered users:</strong>${data.registeredUsers}</p>
    </div>`

  sendEmail(to, 'New user registration • 2k17 Platform', createEmailTemplate(content));
}

async function RegisteredDataMail(to, data) {
  let content = `
    <h2 style="color: #7b5cf0;">Welcome to 2k17 Platform ❤️</h2>
    <p>Hi ${data.user?.name?.trim().split(' ')[0] || 'there'},</p>
    <p style="margin-bottom: 16px;">We sincerely thank you for registering on 2k17 Platform.</p>
    <p style="margin-bottom: 16px;">This are the details we have stored to your account:</p>
    <div class="info-box">
      <p><strong>Name:</strong>${data.user.name || "<Name not specified>"}</p>
      <p><strong>Username:</strong>${data.user.username}</p>
      <p><strong>Email:</strong>${data.user.email}</p>
      ${data.user.dob ? `<p><strong>Date of birth:</strong>${data.user.dob}</p>` : ''}
      <p><strong>Password:</strong>Saved as hash password</p>
      <small>We use industry-standard hashing (bcryptjs) to protect your password. This means no one can know your actual password, not even Ujwal and Prajyot.</small>
    </div>
    <p style="margin-top: 16px;">Begin your journey with us, explore the 2k17 Platform.</p><br>
    <a href="https://twok17.onrender.com/" style="padding:10px 20px; background:#7b5cf0; color:white; text-decoration:none; border-radius:4px;">Visit 2k17 Platform</a>`

  sendEmail(to, "Welcome to 2k17 Platform ❤️", createEmailTemplate(content));
}

async function WeeklyReportMail(to, data) {
  let content = `
    <h2 style="color: #7b5cf0;">Weekly Analytics Report</h2>

    <p style="margin-bottom: 8px;">Hello Admin,</p>
    <p style="line-height:25px; margin-bottom: 16px;">Here’s the monthly analytics summary as of <strong>${new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata'
  })}</strong>:</p>

    <div class="info-box">
      <p><strong>Total Users:</strong>${data.current.total} 
        (${data.change.total.toFixed(0) > 0 ? `<span style="color: green">+${data.change.total.toFixed(0)}%</span> than last month` : `<span style="color: red">${data.change.total.toFixed(0)}%</span> than last month`})</p>
      <p><strong>Known Users:</strong>${data.current.known} 
        (${data.change.known.toFixed(0) > 0 ? `<span style="color: green">+${data.change.known.toFixed(0)}%</span> than last month` : `<span style="color: red">${data.change.known.toFixed(0)}%</span> than last month`})</p>
      <p><strong>Guests:</strong>${data.current.guests} 
        (${data.change.guests.toFixed(0) > 0 ? `<span style="color: green">+${data.change.guests.toFixed(0)}%</span> than last month` : `<span style="color: red">${data.change.guests.toFixed(0)}%</span> than last month`})</p>
      <p><strong>Total Visits:</strong>${data.visits.current} 
        (${data.visits.change.toFixed(0) > 0 ? `<span style="color: green">+${data.visits.change.toFixed(0)}%</span> than last month` : `<span style="color: red">${data.visits.change.toFixed(0)}%</span> than last month`})</p>
      <p><strong>Top Route:</strong>${data.topRoute || 'No data available'}</p>
    </div>

    <p style="line-height: 25px; margin-top: 16px;">For detailed analytics, visit <a href="https://twok17.onrender.com/admin/analytics" style="color: #7b5cf0; text-decoration: underline;">admin dashboard</a>.</p>`

  sendEmail(to, "Weekly Analytics Report", createEmailTemplate(content));
}

async function sendMail(type, to, data) {
  if (type == 'otp') OTPMail(to, data);
  //if (type == 'login') LoginMail(to, data);
  if (type == 'error') AppErrorAlert(to, data);
  if (type == 'report_user') UserReportMail(to, data);
  if (type == 'report_admins') AdminReportMail(to, data);
  if (type == 'verify-new-email') VerifyNewEmailMail(to, data);
  if (type == 'reset-password') ResetPasswordMail(to, data);
  if (type == 'report_resolved') ReportResolvedMail(to, data);
  if (type == 'birthday') BirthdayMail(to, data);
  if (type == 'account_activation') AccountActivationMail(to, data);
  if (type == 'contact_form') ContactFormMail(to, data);
  if (type == 'newsletter_preview') NewsLetterPreviewMail(to, data);
  if (type == 'newsletter') NewsLetterMail(to, data);
  if (type == 'newsletter_subscribe') NewsLetterSubscribeMail(to, data);
  if (type == 'user_registered') UserRegisteredMail(to, data);
  if (type == 'new_user_registration') RegisteredDataMail(to, data);
  if (type == 'weekly_report') WeeklyReportMail(to, data);
  if (type == 'post_mention') PostMentionMail(to, data);
}

module.exports = sendMail;
