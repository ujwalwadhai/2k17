const express = require('express');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const { rateLimit } = require('express-rate-limit');
dotenv.config();
const sanitizeHtml = require('sanitize-html');
var { hasRole, isLoggedIn } = require('./middlewares/auth');

const useragent = require('express-useragent');
const webpush = require('web-push');

const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);

const app = express(); 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    secure: process.env.PLATFORM_TYPE === 'production',
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(require('./middlewares/locals'))

app.set('trust proxy', 1)



const getRoutes = require('./routes/getRoutes');
const postRoutes = require('./routes/postRoutes');

require('./models/Users')
require('./models/Posts')
require('./models/Notifications')
require('./models/Settings')


app.use(express.json({ type: 'application/json' }))
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(useragent.express());

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use((req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        if (key === 'newsLetterContent') {
          req.body[key] = sanitizeHtml(req.body[key], {
            allowedTags: ['p', 'a', 'b', 'strong', 'div', 'section', 'table', 'tr', 'th', 'tbody', 'thead', 'span', 'em', 'i'],
            allowedAttributes: false, 
            disallowedTagsMode: 'discard',
            nonTextTags: ['script'],
            allowedSchemes: ['http', 'https', 'mailto', 'tel'],
          });
        } else {
          req.body[key] = sanitizeHtml(req.body[key], {
            allowedTags: [],
            allowedAttributes: {}
          });
        }
      }
    }
  }
  next();
});

app.use((req, res, next) => {
  const now = new Date()
  const launchDate = new Date(process.env.LAUNCH_DATE || '2025-06-24T00:00:00');

  if (req.method !== 'GET') return next();

  // After launch
  if (now >= launchDate) {
    if (req.path === '/pre-register' || req.path === '/preregister') {
      return res.redirect('/create-account');
    }
    return next();
  }

  // Allow preregister page and admin login (use /login/admin instead of /login to login for testing)
  const publicPaths = ['/login/admin', '/', '/preregister', '/pre-register', '/terms-of-service']; // allowed routes before launch
  if (publicPaths.includes(req.path) || req.path.startsWith('/verify-email/')) {
    return next();
  }
  // Allow access to everything if logged in and role is admin
  if (req?.user?.role === 'admin') {
    return next();
  }

  return res.redirect('/');
});


// app.use('/admin', isLoggedIn, hasRole(['admin']))
app.use('/',require('./middlewares/locals'), getRoutes);
app.use('/', postRoutes);

app.use((req, res) => {
  res.render('pages/404')
})

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.render('pages/404');
})

// Rate limits
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      status: 'fail',
      message: 'You’ve hit the rate limit. Please slow down.'
    });
  }
});
app.use(generalLimiter);


// CRON Jobs for recurring events
require('./cron/logCleanUp')
require('./cron/birthday')
require('./cron/newsletter')

// Cleans the database when server restarts
require('./utils/cleanup')()

require('./config/mailer')

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {}).then(() => {
  console.log('✅ Connected to MongoDB');
  // Start server only after DB is connected
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running\n`);
  });
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});