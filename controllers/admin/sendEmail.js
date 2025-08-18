const sendMail = require('../../config/mailer');
const Users = require('../../models/Users');

const sendEmail = async (req, res) => {
    const { to, heading, body } = req.body;
    let emails = to.split(',').map((email) => email.trim()).filter(Boolean);
    if(to == 'all'){
        emails = await Users.find({}, {email: 1}).distinct('email');
    }
    if(!to || !heading || !body) {
        return res.json({success: false, message: 'Please provide all the required fields' });
    }
    if(emails.length === 0) {
        return res.json({success: false, message: 'Please provide at least one email address' });
    }
    await sendMail('admin_send_mail', emails, {heading, body})
    res.json({success: true, message: 'Email sent successfully' })
}

module.exports = sendEmail;