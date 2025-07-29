// Sets the user object and functions to the response locals, so .ejs files can access it
var { getRelativeTime, formatDOB, createDate } = require('../utils/time');

module.exports = function (req, res, next) {
  if (req.user) {
    var userInfo = {
      id: req.user.id,
      _id: req.user._id,
      name: req.user.name,
      username: req.user.username,
      email: req.user.email,
      profile: req.user.profile,
      role: req.user?.role || 'user'
    }
  }
  res.locals.user = req.user ? userInfo : null;
  res.locals.getRelativeTime = getRelativeTime;
  res.locals.createDate = createDate;
  res.locals.formatDOB = formatDOB;
  res.locals.PLATFORM_TYPE = process.env.PLATFORM_TYPE || 'development';
  res.locals.hasUnreadNotifications = false
  res.locals.theme = req?.user?.theme || 'purple'
  next();
};
