var Users = require('../models/Users');
var Files = require('../models/Files');
var Posts = require('../models/Posts');
var Notifications = require('../models/Notifications');
var Settings = require('../models/Settings');
var getUpcomingBirthdays = require('../utils/birthdays');
const Reports = require('../models/Reports');

exports.indexPage = async (req, res) => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var todayStr = `${dd}/${mm}`;

  var members = await Users.find(
    { name: { $ne: "Ujwal Wadhai" } },
    { profile: 1, name: 1, year: 1, username: 1 }
  ).sort({ role: -1 }).limit(14);

  var featuredImages = await Files.find({ tags: 'featured' });

  var birthdayUsers = await Users.find({
    dob: { $regex: `^${todayStr}/` }
  , verified: true}, {
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
  if(req?.user) return res.redirect('/home');
  if(req.query.failure) {
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

  res.render('pages/admin', { reports });
}

exports.adminUserlist = async (req, res) => {
  try {
    var users = await Users.find({role: { $ne: 'admin' }})
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
    var hasUnreadNotifications = await Notifications.findOne({ $or: [{ user: req.user._id },{ user: null }], seen: false });
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
  if(req?.user) return res.redirect('/home');
  res.render('pages/register');
}

exports.emailLogin = (req, res) => {
  if(req?.user) return res.redirect('/home');
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
  if(user){
    return res.json({success: true, user });
  }
  res.json({success:false, user });
}

async function getSortedUsers(loggedInUserId = null) {
  try {
    const pipeline = [];

    // Add roleOrder for sorting
    pipeline.push({
      $addFields: {
        roleOrder: {
          $switch: {
            branches: [
              { case: { $eq: ["$role", "admin"] }, then: 1 },
              { case: { $eq: ["$role", "moderator"] }, then: 2 },
              ...(loggedInUserId
                ? [{ case: { $eq: ["$_id", loggedInUserId] }, then: 3 }]
                : [])
            ],
            default: 4
          }
        }
      }
    });

    // Sort by role priority
    pipeline.push({
      $sort: { roleOrder: 1 }
    });

    // Split into admins and others
    pipeline.push({
      $facet: {
        admins: [
          { $match: { role: "admin" } },
          { $sort: { name: -1 } }
        ],
        others: [
          { $match: { role: { $ne: "admin" } } },
          { $sort: { name: 1 } }
        ]
      }
    });

    // Merge admins and others back
    pipeline.push({
      $project: {
        users: { $concatArrays: ["$admins", "$others"] }
      }
    });

    // Flatten the array back into documents
    pipeline.push({ $unwind: "$users" });
    pipeline.push({ $replaceRoot: { newRoot: "$users" } });

    // Lookup settings
    pipeline.push({
      $lookup: {
        from: "settings",          // collection name (MongoDB, lowercase plural)
        localField: "_id",         // Users._id
        foreignField: "user",    // Settings.userId
        as: "settings"
      }
    });

    // Unwind to get a single settings object (optional)
    pipeline.push({
      $unwind: {
        path: "$settings",
        preserveNullAndEmptyArrays: true
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
  if (!user) return res.redirect('/');
  if (req.user) {
    var posts = await Posts.find({ author: user._id }).populate("likes", "username profile").sort({ createdAt: -1 });
  } else {
    var posts = await Posts.find({ author: user._id }).populate("likes", "username profile").sort({ createdAt: -1 }).limit(5);
  }
  res.render('pages/profile', { account: user, posts });
}

exports.myProfile = async (req, res) => {
  var user = await Users.findOne({ username: req.user.username });
  if (!user) return res.redirect('/');
  if (req.user) {
    var posts = await Posts.find({ author: user._id }).populate("likes", "username profile").sort({ createdAt: -1 });
  } else {
    var posts = await Posts.find({ author: user._id }).populate("likes", "username profile").sort({ createdAt: -1 }).limit(5);
  }
  res.render('pages/profile', { account: user, posts });
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