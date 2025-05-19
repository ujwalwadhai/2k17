var Users = require('../models/Users');
var Files = require('../models/Files');
var Posts = require('../models/Post');
var Notifications = require('../models/Notifications');
var getUpcomingBirthdays = require('../utils/upcomingBirthdays');
var { formatTimeFromNow } = require('../utils/dateFunctions');
var moment = require('moment');


exports.indexPage = (req, res) => {
  res.render('pages/index');
};
  
exports.login = (req, res) => {
  res.render('pages/login');
}

exports.home = async (req, res) => {
  try{
    res.locals.hasUnreadNotifications = false;
    var birthdays = await getUpcomingBirthdays();
    var hasUnreadNotifications = await Notifications.findOne({ user: req.user._id, seen: false });
    if (hasUnreadNotifications) {
      res.locals.hasUnreadNotifications = true;
    }
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

exports.viewPost = async (req, res) => {
  var post = await Posts.findOne({ _id: req.params.id }).populate('comments.user', 'name profilePicture')
  if(!post) return res.redirect('/');
  var comments = post.comments;
  const formattedComments = comments.map(comment => {
        return {
          ...comment.toObject(),
          timeAgo: moment(comment.createdAt).fromNow()
        };
      });
  post.timeAgo = formatTimeFromNow(post.createdAt);
  res.render('pages/post', {post, comments: formattedComments});
}

exports.viewProfile = async (req, res) => {
  var user = await Users.findOne({ username: req.params.username });
  if(!user) return res.redirect('/');
  var posts = await Posts.find({ author: user._id }).populate("likes", "username profilePicture").sort({ createdAt: -1 });
  var formattedPosts = posts.map(post => {
    return {
      ...post.toObject(),
      timeAgo: formatTimeFromNow(post.createdAt)
    };
  });
  res.render('pages/profile', {account: user, posts: formattedPosts});
}