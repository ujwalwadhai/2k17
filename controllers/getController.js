var Users = require('../models/Users');
var Files = require('../models/Files');
var Posts = require('../models/Posts');
var Notifications = require('../models/Notifications');
var Settings = require('../models/Settings');
var getUpcomingBirthdays = require('../utils/upcomingBirthdays');
var { getRelativeTime } = require('../utils/dateFunctions');

exports.indexPage = async (req, res) => {
  res.render('pages/index');
};
  
exports.login = (req, res) => {
  var { url } = req.query;
  if(!url) url = '/home'
  var exclude = ['/login', '/signup', '/email-login', '/forgot-password', '/reset-password', '/donate', '/logout', '/home']
  if(url[0] !== "/" || exclude.includes(url)) {
    url='/home'
  }
  res.render('pages/login', {redirectURL : url});
}

exports.home = async (req, res) => {
  try{
    res.locals.hasUnreadNotifications = false;
    var birthdays = await getUpcomingBirthdays();
    var hasUnreadNotifications = await Notifications.findOne({ user: req.user._id, seen: false });
    if (hasUnreadNotifications) {
      res.locals.hasUnreadNotifications = true;
    }
    console.log(req.user)
    res.render('pages/home', { birthdays, isHome: true });
  } catch(err) {
    res.redirect("/login")
  }
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

    var users = await Users.aggregate(pipeline);
    return users;
  } catch (err) {
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

exports.viewPost = async (req, res) => {
  var post = await Posts.findOne({ _id: req.params.id }).populate('comments.user', 'name profile')
  if(!post) return res.redirect('/');
  var comments = post.comments;
  res.render('pages/post', {post, comments});
}

exports.viewProfile = async (req, res) => {
  var user = await Users.findOne({ username: req.params.username });
  if(!user) return res.redirect('/');
  if(req.user){
    var posts = await Posts.find({ author: user._id }).populate("likes", "username profile").sort({ createdAt: -1 });
  } else {
    var posts = await Posts.find({ author: user._id }).populate("likes", "username profile").sort({ createdAt: -1 }).limit(5); 
  }
  res.render('pages/profile', {account: user, posts});
}

exports.myProfile = async (req, res) => {
  var user = await Users.findOne({ username: req.user.username });
  if(!user) return res.redirect('/');
  if(req.user){
    var posts = await Posts.find({ author: user._id }).populate("likes", "username profile").sort({ createdAt: -1 });
  } else {
    var posts = await Posts.find({ author: user._id }).populate("likes", "username profile").sort({ createdAt: -1 }).limit(5); 
  }
  res.render('pages/profile', {account: user, posts});
}

exports.editProfile = async (req, res) => {
  var user = await Users.findOne({ username: req.user.username });
  if(!user) return res.redirect('/');
  res.render('pages/edit-profile', {account: user});
}

exports.settings = async (req, res) => {
  var user = await Users.findOne({ username: req.user.username });
  if(!user) return res.redirect('/');
  var settings = await Settings.findOne({ user: user._id });
  res.render('pages/settings', {account: user, settings});
}