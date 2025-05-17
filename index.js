const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);

const app = express();
app.use(session({
  secret: '2k17-batch',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(require('./middlewares/user'))

const getRoutes = require('./routes/getRoutes');
const postRoutes = require('./routes/postRoutes');

require('./models/Users')
require('./models/Comment')
require('./models/Like')
require('./models/Post')
require('./models/Notifications')
require('./models/UserSettings')

dotenv.config();


// Middleware
app.use(express.urlencoded({ extended: true }));
/* app.use((req, res, next) => {
    express.json()
    console.log(JSON.stringify(req));
    next();
}); */

app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json('application/json'))
// Routes
app.use('/', getRoutes);
app.use('/', postRoutes);

app.use((req, res) => {
    res.redirect("/")
})
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})


var { formatDate, formatDate2, createDate, getWeekDay, formatTimeFromNow } = require('./utils/dateFunctions');
app.locals.formatDate = formatDate;
app.locals.createDate = createDate;
app.locals.getWeekDay = getWeekDay;
app.locals.formatDate2 = formatDate2;
app.locals.formatTimeFromNow = formatTimeFromNow;
app.locals.hasUnreadNotifications = false

require('./config/mailer')

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {}).then(() => {
    console.log('✅ Connected to MongoDB');
    // Start server only after DB is connected
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}\n`);
    });
}).catch((err) => {
    console.error('❌ MongoDB connection error:', err);
});
