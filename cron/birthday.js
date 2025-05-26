var cron = require('node-cron');
var Users = require('../models/Users');
var sendMail = require('../config/mailer');

cron.schedule('*/30 * * * *', async () => {
    var now = new Date();
    var offset = now.getTimezoneOffset();

    let istTime = now;
    if (offset !== -330) {
        istTime = new Date(now.getTime() + (330 + offset) * 60 * 1000);
    }

    var hours = istTime.getHours();
    var minutes = istTime.getMinutes();

    if (hours === 0 && minutes < 30) {
        console.log('📧 Sending birthday emails...');
        try {
            var currentMonth = istTime.getMonth() + 1;
            var currentDay = istTime.getDate();

            var users = await Users.find({ dob: { $exists: true } });

            var birthdayUsers = users.filter(user => {
                if (!user.dob) return false;
                var [day, month, year] = user.dob.split('/').map(Number); // Split "dd/mm/yyyy"
                var dobMonth = month;
                var dobDay = day;
                return dobMonth === currentMonth && dobDay === currentDay;
            });

            for (var user of birthdayUsers) {
                await sendMail('birthday', user.email, { name: `${user.name.split(' ')[0]} ${user.name.split(' ')[1][0]}.`});
                console.log(`✅ Sent birthday email to ${user.name}.`)
            }

            console.log(`✅ Sent ${birthdayUsers.length} birthday emails at IST midnight.`);
        } catch (err) {
            console.error('❌ Error sending birthday emails:', err);
        }
    }
});