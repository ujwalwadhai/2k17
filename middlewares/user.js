// Sets the user object to the response locals, so .ejs files can access it
module.exports = function (req, res, next) {
  res.locals.user = req.user || null;
  next();
};
