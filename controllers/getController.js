var Users = require('../models/User');

exports.indexPage = (req, res) => {
  res.render('pages/index');
};
  
exports.login = (req, res) => {
  res.render('pages/login');
}

exports.home = (req, res) => {
  res.send("This is home")
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

async function getSortedUsers() {
  try {
    var users = await Users.aggregate([
      {
        $addFields: {
          roleOrder: {
            $cond: [
              { $eq: ["$role", "admin"] }, 1,
              {
                $cond: [
                  { $eq: ["$role", "moderator"] }, 2,
                  3 // All other roles (like user, guest, etc.)
                ]
              }
            ]
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
          roleOrder: 0 // optional: remove temp field
        }
      }
    ]);

    return users;
  } catch (err) {
    console.error("Error fetching sorted users:", err);
    return [];
  }
}

exports.members = async (req, res) => {
  var members = await getSortedUsers();
  res.render('pages/members', {members});
}