var Users = require('../models/Users');
var ActiveUsers = require('../models/ActiveUsers');
var DailyUsers = require('../models/DailyUsers');
var Files = require('../models/Files');
var Posts = require('../models/Posts');
var Badges = require('../models/Badges');
var Notifications = require('../models/Notifications');
var Settings = require('../models/Settings');
var getUpcomingBirthdays = require('../utils/birthdays');
const Reports = require('../models/Reports');

exports.indexPage = async (req, res) => {
  var todayStr = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit' });
  if (req.user) {
    var members = await Users.find(
      { name: { $ne: "Ujwal Wadhai" }, username: { $ne: '2k17platform' } },
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
  }

  var admins = await Users.find({ role: 'admin', username: { $ne: '2k17platform' } }, { profile: 1, name: 1, username: 1, socialLinks: 1 });

  res.render('pages/index', {
    members: members ?? [],
    featuredImages: featuredImages ?? [],
    birthdayUsers: birthdayUsers ?? [],
    admins
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

  res.render('pages/admin/dashboard', { reports, activeUsers, usersToday });
}

exports.analyticsPage = async (req, res) => {
  res.render('pages/admin/analytics');
}

let cachedBirthdays = [];
let cachedFeaturedPhotos = [];
let cachedMembers = []

const refreshCache = async () => {
  try {
    const [birthdays, photos, members] = await Promise.all([
      getUpcomingBirthdays(),
      Files.aggregate([{ $match: { tags: 'featured' } }]),
      getSortedUsers()
    ]);

    cachedBirthdays = birthdays;
    cachedFeaturedPhotos = photos;
    cachedMembers = members

  } catch (err) {
    console.error('Failed to refresh cache:', err);
  }
};

setInterval(refreshCache, 3600000 * 12);

refreshCache();

exports.home = async (req, res) => {
  try {
    const hasUnreadNotifications = await Notifications.countDocuments(
      { $or: [{ user: req.user._id }, { user: null }], seen: false })

    const randomPhoto = cachedFeaturedPhotos.length
      ? cachedFeaturedPhotos[Math.floor(Math.random() * cachedFeaturedPhotos.length)]
      : null;

    res.render('pages/home', {
      birthdays: cachedBirthdays.reverse(),
      featuredPhoto: randomPhoto,
      hasUnreadNotifications: hasUnreadNotifications > 0,
      isHome: true
    });

  } catch (err) {
    console.log(err);
    res.redirect("/login");
  }
};

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


exports.contribute = (req, res) => {
  res.render('pages/contribute');
}

exports.adminUserInfo = async (req, res) => {
  var user = await Users.findOne({ _id: req.params.userId }).select('+code');
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
            if: {
              $and: [
                loggedInUserId,
                { $eq: ["$_id", loggedInUserId] }
              ]
            },
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
    const final = users.filter(user => user._id.toString() !== '6899e28c181c7329d31384bc');
    return final;

  } catch (err) {
    console.log(err);
    return [];
  }
}


exports.members = async (req, res) => {
  var members = cachedMembers
  res.render('pages/members', { members });
}

exports.viewProfile = async (req, res) => {
  let username = req.params.username ?? req.user.username;
  var user = await Users.findOne({ username }).populate("settings earnedBadges.badge");
  if (!user) return res.redirect('/');
  user.earnedBadges = Array.from(new Map(user.earnedBadges.map(item => [item.badge.id, item])).values());
  await user.save()
  var memories = await Files.find({ people: user._id })
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
  var user = await Users.findOne({ username: req.user.username }).lean();
  if (!user) return res.redirect('/');
  var settings = await Settings.findOne({ user: user._id });
  res.render('pages/settings', { account: user, settings });
}


// ganesha theme render game
exports.modakGame = async (req, res) => {
  var user = req.user ? await Users.findOne({ username: req.user.username }).select("modakScore") : null;
  res.render('pages/modak-game', { score: user?.modakScore ?? 0 });
}

// ganesha theme score update
exports.modakScore = async (req, res) => {
  if(!req.user) return
  await Users.findOneAndUpdate({ username: req.user.username }, { $set: { modakScore: JSON.parse(req.body).score } }, { new: true });
}

exports.badges = async (req, res) => {
  var user = await Users.findOne({ username: req.user.username }).populate("earnedBadges.badge");
  if (!user) return res.redirect('/');
  var badges = await Badges.find();
  res.render('pages/badges', { earnedBadges: user.earnedBadges, badges });
}