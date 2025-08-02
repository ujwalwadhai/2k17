var Users = require('../models/Users');
var ActiveUsers = require('../models/ActiveUsers');
var DailyUsers = require('../models/DailyUsers');
var Files = require('../models/Files');
var Posts = require('../models/Posts');
var Notifications = require('../models/Notifications');
var Settings = require('../models/Settings');
var getUpcomingBirthdays = require('../utils/birthdays');
const Reports = require('../models/Reports');

exports.indexPage = async (req, res) => {
  var todayStr = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit' });

  var members = await Users.find(
    { name: { $ne: "Ujwal Wadhai" } },
    { profile: 1, name: 1, year: 1, username: 1 }
  ).sort({ role: -1 }).limit(14);

  var featuredImages = await Files.find({ tags: 'featured' });

  var birthdayUsers = await Users.find({
    dob: { $regex: `^${todayStr}/` }
    , verified: true
  }, {
    name: 1,
    username: 1,
    profile: 1,
    dob: 1
  });

  res.render('pages/index', {
    members,
    featuredImages,
    birthdayUsers
  });
};


exports.termsOfService = (req, res) => {
  res.render('pages/terms-of-service');
}

exports.login = (req, res) => {
  if (req?.user) return res.redirect('/home');
  if (req.query.failure) {
    return res.render('pages/login', { error: 'Something went wrong. Please try again later.' });
  }
  res.render('pages/login');
}

exports.admin = async (req, res) => {
  var reports = await Reports.find({
    $or: [
      { resolution: { $exists: false } },
      { resolution: null },
      { resolution: '' }
    ]
  })
    .populate('user', 'username')
    .sort({ createdAt: -1 })
    .limit(100);

  const since = new Date(Date.now() - 20000);
  const activeUsers = await ActiveUsers.countDocuments({ last_ping: { $gte: since } })

  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' });
  const usersToday = await DailyUsers.countDocuments({ date: today });

  res.render('pages/admin', { reports, activeUsers, usersToday });
}

exports.adminUserlist = async (req, res) => {
  try {
    var users = await Users.find({ role: { $ne: 'admin' } })
      .sort({ registered: -1, name: 1 })

    res.render('pages/admin-users', { users });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}

exports.analyticsPage = async (req, res) => {
  res.render('pages/analytics');
}

exports.home = async (req, res) => {
  try {
    res.locals.hasUnreadNotifications = false;
    var birthdays = await getUpcomingBirthdays();
    var hasUnreadNotifications = await Notifications.findOne({ $or: [{ user: req.user._id }, { user: null }], seen: false });
    const [photo] = await Files.aggregate([
      { $match: { tags: 'featured' } },
      { $sample: { size: 1 } }
    ]);
    if (hasUnreadNotifications) {
      res.locals.hasUnreadNotifications = true;
    }
    res.render('pages/home', { birthdays, featuredPhoto: photo, isHome: true, onboarding: Boolean(req.query.onboarding) || false });
  } catch (err) {
    console.log(err);
    res.redirect("/login")
  }
}

exports.register = (req, res) => {
  if (req?.user) return res.redirect('/home');
  res.render('pages/register');
}

exports.emailLogin = (req, res) => {
  if (req?.user) return res.redirect('/home');
  res.render('pages/email-login');
}

exports.renderResetPage = async (req, res) => {
  var { token } = req.params;
  var settings = await Settings.findOne({ "passwordReset.token": token });

  if (!settings || settings.passwordReset.expiry < Date.now()) {
    return res.send("Link expired or invalid");
  }

  res.render("pages/reset-password", { token });
};


exports.donate = (req, res) => {
  res.render('pages/donate');
}

exports.adminUserInfo = async (req, res) => {
  var user = await Users.findOne({ _id: req.params.userId }).select("+code");
  if (user) {
    return res.json({ success: true, user });
  }
  res.json({ success: false, user });
}

async function getSortedUsers(loggedInUserId = null) {
  try {
    const pipeline = [];
    
    pipeline.push({
      $addFields: {
        isAdmin: {
          $cond: { if: { $eq: ["$role", "admin"] }, then: 1, else: 0 }
        },
        isLoggedInUser: {
          $cond: {
            if: { $and: [
                loggedInUserId,
                { $eq: ["$_id", loggedInUserId] }
            ]},
            then: 1,
            else: 0
          }
        }
      }
    });

    pipeline.push({
      $sort: {
        isLoggedInUser: -1,  
        isAdmin: -1,    
        house: 1,
        name: 1            
      }
    });

    pipeline.push({
      $lookup: {
        from: "settings",
        localField: "_id",     
        foreignField: "user",  
        as: "settings"
      }
    });

    pipeline.push({
      $unwind: {
        path: "$settings",
        preserveNullAndEmptyArrays: true
      }
    });

    pipeline.push({
      $project: {
        isAdmin: 0,
        isLoggedInUser: 0
      }
    });

    const users = await Users.aggregate(pipeline);
    return users;

  } catch (err) {
    console.log(err);
    return [];
  }
}


exports.members = async (req, res) => {
  if (req.user) {
    var members = await getSortedUsers(req.user._id);
  } else {
    var members = await getSortedUsers();
  }
  res.render('pages/members', { members });
}

exports.viewProfile = async (req, res) => {
  var user = await Users.findOne({ username: req.params.username }).populate("settings");
  var memories = await Files.find({ people: user._id })
  if (!user) return res.redirect('/');
  if (req.user) {
    var posts = await Posts.find({ author: user._id }).populate("likes", "username profile").sort({ createdAt: -1 });
  } else {
    var posts = await Posts.find({ author: user._id }).populate("likes", "username profile").sort({ createdAt: -1 }).limit(5);
  }
  res.render('pages/profile', { account: user, posts, memories });
}

exports.myProfile = async (req, res) => {
  var user = await Users.findOne({ username: req.user.username }).populate('settings');
  var memories = await Files.find({ people: user._id })
  if (!user) return res.redirect('/');
  if (req.user) {
    var posts = await Posts.find({ author: user._id }).populate("likes", "username profile").sort({ createdAt: -1 });
  } else {
    var posts = await Posts.find({ author: user._id }).populate("likes", "username profile").sort({ createdAt: -1 }).limit(5);
  }
  res.render('pages/profile', { account: user, posts, memories });
}

exports.editProfile = async (req, res) => {
  var user = await Users.findOne({ username: req.user.username });
  if (!user) return res.redirect('/');
  res.render('pages/edit-profile', { account: user });
}

exports.settings = async (req, res) => {
  var user = await Users.findOne({ username: req.user.username });
  if (!user) return res.redirect('/');
  var settings = await Settings.findOne({ user: user._id });
  res.render('pages/settings', { account: user, settings });
}