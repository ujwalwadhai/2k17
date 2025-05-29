var sendMail = require('../../config/mailer')

const contactForm = async (req, res) => {
    var { email, text } = req.body
    try {
        await sendMail('contact_form', '2k17platform@gmail.com', { email, text })
        res.json({ success:true, message: 'Email sent successfully' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success:false, message: 'Error sending email' })
    }
}

module.exports = contactForm;