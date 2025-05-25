const LocalStrategy = require('passport-local').Strategy;
const Users = require('../models/Users');

module.exports = function (passport) {
  passport.use(new LocalStrategy(
  { usernameField: 'username', passwordField: 'password' },
  async (username, password, done) => {
    try {
      const user = await Users.findOne({
        $or: [{ username: username }, { email: username }]
      });
      if (!user) return done(null, false, { message: 'User not found.' });

      const isMatch = await user.validatePassword(password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password.' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));


  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Users.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
