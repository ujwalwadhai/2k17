const Users = require('../../models/Users');

const adminUserlist = async (req, res) => {
  try {
    var users = await Users.find({ role: { $not: /admin|moderator/ } })
      .sort({ registered: -1, name: 1 })

    res.render('pages/admin-users', { users });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = adminUserlist;