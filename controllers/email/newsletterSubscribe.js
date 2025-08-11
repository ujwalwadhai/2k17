var sendMail = require("../../config/mailer");
var Users = require("../../models/Users");

var newsletterSubscribe = async (req, res) => {
    var { email } = req.body;
    try{
        var admins = await Users.find({ role: "admin", username: {$ne: '2k17platform'} }, {email:1});
        var adminEmails = admins.map(u => u.email)
        await sendMail('newsletter_subscribe', adminEmails, {email});
        res.json({success: true})
    } catch (err) {
        console.log(err);
        res.json({success: false})
    }
}

module.exports = newsletterSubscribe;