const Users = require("../../models/Users");

const logout = async (req, res) => {
  if (req.user) {
    var user = await Users.findOne({ _id: req.user._id });
  req.logout(err => {
    if (err) {
      console.log(err);
      return res.status(500).send('Logout failed');
    }

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      if(user.role == 'admin') return res.redirect('/login?admin=true');
      res.redirect('/login');
    });
  });
}
};

module.exports = logout;