var Users = require('../../models/Users');
var Settings = require('../../models/Settings');
var logActivity = require('../../utils/log');

const verifyEmail = async (req, res) => {
  try {
    var { token } = req.params;
    var settings = await Settings.findOne({ 'emailVerification.token': token });

    var user = await Users.findById(settings.user);
    if(user.verified) return res.send('<h2 style="color:green;">Email already verified.</h2>');
    
    if (!settings || !settings.emailVerification || new Date() > settings.emailVerification.expiry) {
      return res.send('<h2 style="color:red;">Invalid or expired link.</h2>');
    }

    if (!user) return res.send('<h2 style="color:red;">User not found.</h2>');

    user.email = settings.emailVerification.newEmail;
    user.verified = true
    await user.save();

    settings.emailVerification = undefined;
    await settings.save();
    logActivity(user._id, 'Email Change' ,`Changed email to ${user.email}`);
    return res.send('<h2 style="color:green;">Email successfully verified and updated!</h2><script>setTimeout(()=> window.location.href="/home", 2000)</script>');
  } catch (err) {
    console.log(err);
    res.send('<h2 style="color:red;">Something went wrong.</h2>');
  }
}

module.exports = verifyEmail;