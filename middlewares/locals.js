// Sets the user object and functions to the response locals, so .ejs files can access it
var { getRelativeTime, formatDOB, createDate } = require('../utils/time');
module.exports = function (req, res, next) {
  res.locals.user = req.user || null;
  res.locals.getRelativeTime = getRelativeTime;
  res.locals.createDate = createDate;
  res.locals.formatDOB = formatDOB;
  res.locals.PLATFORM_TYPE = process.env.PLATFORM_TYPE || 'development';
  res.locals.hasUnreadNotifications = false
  next();
};
 