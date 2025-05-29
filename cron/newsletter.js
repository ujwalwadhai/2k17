var cron = require('node-cron');
var Newsletters = require('../models/Newsletters');
var Users = require('../models/Users');
var sendMail = require('../config/mailer');
var { DateTime } = require('luxon');

function checkToday(dateToCheck) {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST = UTC +5:30
  const istDate = new Date(now.getTime() + istOffset);
  const day = String(istDate.getDate()).padStart(2, '0');
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const year = istDate.getFullYear();
  const todayStr = `${day}/${month}/${year}`;
  return todayStr === dateToCheck
}

cron.schedule('0 9 * * *', async () => {
    var now = new Date();
    var newsletter = await Newsletters.findOne({ published: false }).sort({ createdAt: -1 });

    if (newsletter && checkToday(newsletter.scheduledAt)) {
        var users = await Users.find({}, 'email');

        var recipients = users.map(u => u.email).join(',');

        await sendMail('newsletter', recipients, {
            title: newsletter.title,
            content: newsletter.content
        });

        newsletter.published = true;
        await newsletter.save();
    }
}, {
  timezone: "Asia/Kolkata"
});

module.exports = this