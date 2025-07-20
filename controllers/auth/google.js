const passport = require("passport");

const googleAuth = passport.authenticate("google", { scope: ["profile", "email"] });

const googleAuthCallback = passport.authenticate("google", {
  failureRedirect: "/login?failure=true"
});

const googleRedirectSuccess = (req, res) => {
  res.redirect("/home");
};

module.exports = {
  googleAuth,
  googleAuthCallback,
  googleRedirectSuccess
};
