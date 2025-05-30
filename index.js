const express = require('express');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
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

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const webPushContactEmail = process.env.WEB_PUSH_CONTACT_EMAIL;

if (!vapidPublicKey || !vapidPrivateKey || !webPushContactEmail) {
  console.error("VAPID keys or contact email not set. Please generate VAPID keys and set them in your environment variables.");
} else {
  webpush.setVapidDetails(
    `mailto:${webPushContactEmail}`,
    vapidPublicKey,
    vapidPrivateKey
  );
  console.log("Web Push VAPID details configured.");
}

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
  console.log(req.session)
  next();
});

app.use('/admin', isLoggedIn, hasRole(['admin']))
app.use('/', getRoutes);
app.use('/', postRoutes);

app.use((req, res) => {
  res.redirect("/")
})
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
})

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