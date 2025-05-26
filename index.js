const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const sanitizeHtml = require('sanitize-html');

const useragent = require('express-useragent');

const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);

const app = express();
app.use(session({
  secret: '2k17-batch',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(require('./middlewares/locals'))

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
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {}
        });
      }
    }
  }
  next();
});
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