const Users = require('../../models/Users');


var searchUsers = async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) return res.json([]);

  const users = await Users.find({
    $or: [
      { username: { $regex: '^' + keyword, $options: 'i' } },
      { name: { $regex: '^' + keyword, $options: 'i' } }
    ]
  })
    .select('username name profile')
    .limit(5);

  res.json(users);
};

module.exports = searchUsers;
