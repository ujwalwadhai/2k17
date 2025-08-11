var Newsletters = require('../../models/Newsletters');
var Users = require('../../models/Users');
var logActivity = require('../../utils/log');
var sendMail = require('../../config/mailer');

var createNewsLetter = async (req, res) => {
    var { title, newsLetterContent, scheduledAt } = req.body;
    var admins = await Users.find({ role: 'admin', username: {$ne: '2k17platform'} }, {email:1});
    var adminEmails = admins.map(u => u.email);
    try{
        var newsletter = new Newsletters({
            title,
            content: newsLetterContent,
            scheduledAt
        });
        await newsletter.save();
        await logActivity(req.user._id, `New newsletter created (${newsletter._id})`);
        await sendMail('newsletter_preview', adminEmails, { title, content: newsLetterContent, scheduledAt });
        res.json({success: true, message: 'Newsletter created successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Something went wrong' });
    }
}

module.exports = createNewsLetter;