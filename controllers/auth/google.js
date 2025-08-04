const passport = require("passport");
var deviceInfo = require('../../middlewares/device')

const googleAuth = passport.authenticate("google", { scope: ["profile", "email"] });

const googleAuthCallback = passport.authenticate("google", {
  failureRedirect: "/login?failure=true"
});

const googleRedirectSuccess = (req, res) => {
  req.session.device = deviceInfo(req.useragent);
  req.session.method = 'google';
  res.redirect("/home");
};

module.exports = {
  googleAuth,
  googleAuthCallback,
  googleRedirectSuccess
};
