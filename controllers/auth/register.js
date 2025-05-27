var Users = require('../../models/Users');
var logActivity = require('../../utils/log');

const register = async (req, res) => {
  var { username, email, code } = req.body;
  try {
    var user = await Users.findOne({ code });
    if (!user) {
      return res.json({ success: false, message: 'Invalid code or already registered' });
    }
    var user2 = await Users.findOne({ username: username });
    if (user2) {
      return res.json({ success: false, message: 'Username already taken' });
    }

    user.username = username;
    user.email = email;
    user.registered = true;
    await user.save();
    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return res.json({ success: false, message: 'Something went wrong' });
      }
      logActivity(user._id, 'Account Activation');
      return res.json({ success: true, message: 'Registration successful', redirect: '/home' });
    })
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = register;