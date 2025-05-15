var Users = require('../models/User');
var Files = require('../models/Files');

exports.indexPage = (req, res) => {
  res.render('pages/index');
};
  
exports.login = (req, res) => {
  res.render('pages/login');
}

exports.home = (req, res) => {
  res.render('pages/home')
}

exports.createAccount = (req, res) => {
  res.render('pages/signup');
}

exports.emailLogin = (req, res) => {
  res.render('pages/email-login');
}

exports.donate = (req, res) => {
  res.render('pages/donate');
}

exports.logout = (req, res) => {
  req.logout(err => {
    if (err) {
      console.log('Logout error:', err);
      return res.status(500).send('Logout failed');
    }

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  });
};

async function getSortedUsers(loggedInUserId = null) {
  try {
    let pipeline = [];

    if (loggedInUserId) {
      pipeline = [
        {
          $addFields: {
            roleOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$role", "admin"] }, then: 1 },
                  { case: { $eq: ["$role", "moderator"] }, then: 2 },
                  { case: { $eq: ["$_id", loggedInUserId] }, then: 3 }
                ],
                default: 4
              }
            }
          }
        },
        {
          $sort: {
            roleOrder: 1,
            name: 1
          }
        },
        {
          $project: {
            roleOrder: 0
          }
        }
      ];
    } else {
      pipeline = [
        {
          $addFields: {
            roleOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ["$role", "admin"] }, then: 1 },
                  { case: { $eq: ["$role", "moderator"] }, then: 2 }
                ],
                default: 3
              }
            }
          }
        },
        {
          $sort: {
            roleOrder: 1,
            name: 1
          }
        },
        {
          $project: {
            roleOrder: 0
          }
        }
      ];
    }

    const users = await Users.aggregate(pipeline);
    return users;
  } catch (err) {
    console.error("Error fetching sorted users:", err);
    return [];
  }
}


exports.members = async (req, res) => {
  if(req.user){
    var members = await getSortedUsers(req.user._id);
  } else {
    var members = await getSortedUsers();
  }
  res.render('pages/members', {members});
}

exports.gallery = async (req, res) => {
  var media = await Files.find();
  res.render('pages/gallery', {media});
}