var cron = require('node-cron');
var Users = require('../models/Users');
var sendMail = require('../config/mailer');
const logActivity = require('../utils/log');

function isBirthday(dob) {
    var [dd, mm] = dob.split('/');
    dd = dd.padStart(2, '0')
    mm = mm.padStart(2, '0')
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST = UTC +5:30
    const istDate = new Date(now.getTime() + istOffset);
    const day = String(istDate.getDate()).padStart(2, '0');
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const todayStr = `${day}/${month}`;
    var dobNew = `${dd}/${mm}`
    return todayStr === dobNew
}

cron.schedule('0 0 * * *', async () => {
    try {
        var users = await Users.find({ dob: { $exists: true }, verified: true });

        var birthdayUsers = users.filter(user => {
            if (!user.dob) return false;
            if (!user.email) return false;
            return isBirthday(user.dob);
        });

        for (var user of birthdayUsers) {
            if (!user.email) continue;
            await sendMail('birthday', user.email, { name: `${user.name.split(' ')[0]}` });
            console.log(`✅ Sent birthday email to ${user.name}.`)
        }

        console.log(`✅ Sent ${birthdayUsers.length} birthday emails at IST midnight.`);

        // ganesha theme send wish to all users
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST = UTC +5:30
        const istDate = new Date(now.getTime() + istOffset);
        const day = String(istDate.getDate()).padStart(2, '0');
        const month = String(istDate.getMonth() + 1).padStart(2, '0');
        const todayStr = `${day}/${month}`;
        if(todayStr === '27/08'){
            users.forEach(async user => {
                await sendMail('ganesha_wish', user.email, { name: `${user.name.split(' ')[0]}` });
            })
            logActivity('', 'Sent Ganesh Chaturthi wish to all users.')
        }

    } catch (err) {
        console.error('❌ Error sending birthday emails:', err);
    }
}, {
    timezone: "Asia/Kolkata"
});