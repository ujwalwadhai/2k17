var Users = require('../../models/Users');

const checkUsername = async (req, res) => {
  var { username } = req.body;
  try {
    var user = await Users.findOne({ username: username });
    if (user) {
      return res.json({ success: false, message: 'Username already taken' });
    }
    return res.json({ success: true, message: 'Username available' });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = checkUsername;