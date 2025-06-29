const cron = require('node-cron');
const Users = require('../models/Users');
const sendMail = require('../config/mailer');

const LAUNCH_DATE_UTC = new Date(process.env.LAUNCH_DATE);

cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));

  const launch = new Date(LAUNCH_DATE_UTC);
  const istLaunch = new Date(launch.getTime() + (5.5 * 60 * 60 * 1000));

  const isSameDate =
    istNow.getFullYear() === istLaunch.getFullYear() &&
    istNow.getMonth() === istLaunch.getMonth() &&
    istNow.getDate() === istLaunch.getDate();

  if (isSameDate) {
    try {
      const users = await Users.find({}, 'email name username').select('+code');

      users.forEach(async (user) => {
        if (user.email) {
          await sendMail("platform_launch", user.email, { user });
          console.log('✅ Launch email sent to:', user.email);
        }
      });

      sendMail("launch_emails_sent", 'wadhaiujwal@gmail.com', {success: true})
    } catch (err) {
      console.error('❌ Error sending launch email:', err);
      sendMail("launch_emails_sent", 'wadhaiujwal@gmail.com', {success: false})
    }
  }
}, {
  timezone: "Asia/Kolkata"
});

module.exports = cron;