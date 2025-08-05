const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Users = require('../models/Users');
const Settings = require('../models/Settings');
const { uploadFromUrl } = require('./cloudinary');
const sendMail = require('./mailer');
const logActivity = require('../utils/log');

module.exports = function (passport) {
  // Local Strategy
  passport.use(
    new LocalStrategy(
      { usernameField: 'username', passwordField: 'password' },
      async (username, password, done) => {
        try {
          const user = await Users.findOne({
            $or: [{ username }, { email: username }]
          });

          if (!user) return done(null, false, { message: 'User not found.' });

          const isMatch = await user.validatePassword(password);
          if (!isMatch) return done(null, false, { message: 'Incorrect password.' });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const verified = profile.emails[0].verified;

          if (!verified) return done(null, false, { message: 'Google email not verified.' });

          let user = await Users.findOne({ email });

          if (!user) {
            const newUser = await Users.create({
              name: profile.displayName || email.split('@')[0],
              email,
              username: email.split('@')[0],
              profile: '',
              createdAt: new Date(),
              registered: true,
              verified: true,
              googleId: profile.id,
              lastLogin: new Date()
            });
 
            if (profile.photos?.[0]?.value) {
              try {
                const uploaded = await uploadFromUrl(profile.photos[0].value, `profile_${newUser._id}`);
                await Users.findOneAndUpdate({ email }, { profile: uploaded });
              } catch (err) {
                console.error('Cloudinary upload failed:', err);
              }
            }
            logActivity(newUser._id, 'Created account using Google');
            await newUser.save();

            await sendMail("new_user_registration", email, { user: newUser });
            console.log('✅ Registration credentials sent', email);

            await Settings.create({ user: newUser._id });

            var admins = await Users.find({ role: 'admin' }, { email: 1 });
            var adminEmails = admins.map(u => u.email);
            var totalUsers = await Users.countDocuments();
            var verifiedUsers = await Users.countDocuments({ verified: true });
            var registeredUsers = await Users.countDocuments({ registered: true });
            await sendMail('user_registered', adminEmails, { name: newUser.name, email, username: newUser.username, totalUsers, verifiedUsers, registeredUsers, method: 'Google' });
            return done(null, newUser);
          }

          await Users.findOneAndUpdate({ email }, { lastLogin: new Date() });

          if (!user.googleId) {
            user.googleId = profile.id;
          }
          if (!user.profile || user.profile.trim() === '') {
            const photoUrl = profile.photos?.[0]?.value;
            if (photoUrl) {
              const cloudUrl = await uploadFromUrl(photoUrl, `google_${user._id}`);
              if (cloudUrl) {
                user.profile = cloudUrl;
              }
            }
          }
          logActivity(user._id, 'Logged in using Google');
          await user.save();

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Session management
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
