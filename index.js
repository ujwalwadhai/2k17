const express = require('express');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const sendMail = require('./config/mailer')
const { rateLimit } = require('express-rate-limit');
const sanitizeHtml = require('sanitize-html');
var { hasRole, isLoggedIn } = require('./middlewares/auth');

const useragent = require('express-useragent');

const session = require('express-session');
const passport = require('passport');
dotenv.config();
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

app.use(async (req, res, next) => {
  if (req.user && (req.user.lastActive == null || req.user.lastActive < Date.now() - 1000 * 60 * 5)) {
    req.user.lastActive = Date.now();
    await req.user.save()
  }
  next();
});
dotenv.config();

const getRoutes = require('./routes/getRoutes');
const postRoutes = require('./routes/postRoutes');

require('./models/Users')
require('./models/DailyUsers')
require('./models/Posts')
require('./models/Notifications')
require('./models/Settings')
require('./models/ActiveUsers')
require('./models/PageViews')
require('./models/UserSessions')
require('./models/Quiz')
require('./models/Attempt')

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
            allowedTags: ['p', 'a', 'b', 'strong', 'div', 'section', 'table', 'tr', 'th', 'tbody', 'thead', 'span', 'em', 'i', 'br'],
            allowedAttributes: false,
            disallowedTagsMode: 'discard',
            nonTextTags: ['script'],
            allowedSchemes: ['http', 'https', 'mailto', 'tel'],
          });
        } else if (key === 'text') {
          req.body[key] = sanitizeHtml(req.body[key], {
            allowedTags: ['p', 'b', 'i', 'u', 'a', 'strong', 'em'],
            allowedAttributes: { 'a': ['href', 'target'] },
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
  if (req.session && req.user) {
    req.session.lastActive = new Date();
  }
  next();
})

app.use('/admin', isLoggedIn, hasRole('admin'))
app.get('/api/analytics', isLoggedIn, hasRole('admin'))
app.use('/', require('./middlewares/locals'), getRoutes);
app.use('/', postRoutes);

app.use((req, res) => {
  res.render('pages/404')
})

app.use(async (err, req, res, next) => {
  console.error(err);
  if (process.env.PLATFORM_TYPE !== 'developement') {
    const stackLines = err.stack.split('\n').map(line => line.trim());
    const errorMessage = stackLines.shift();
    const appLines = stackLines.filter(line => !line.includes('node_modules'));
    const errorData = `${appLines.slice(0, 10).join('\n')}`;
    const errorTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    await sendMail('error', [process.env.UJWAL_EMAIL, process.env.PRAJYOT_EMAIL], { errorData, req, errorTime, errorMessage })
  }
  res.render('pages/500');
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
require('./cron/birthday')
require('./cron/newsletter')
require('./cron/weeklyReport')
require('./cron/popularFilePost')

require('./config/mailer')

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {}).then(() => {
  console.log('✅ Connected to MongoDB');
  // Start server only after DB is connected
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running\n`);
  });
  require('./cron/logCleanUp')
  require('./cron/sessionCleanUp')
  require('./cron/closeSessions')
  require('./utils/cleanup')()
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});