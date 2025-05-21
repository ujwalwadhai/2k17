const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const useragent = require('express-useragent');


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
require('./models/Posts')
require('./models/Notifications')
require('./models/Settings')

dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname+'/public'));
app.use(useragent.express());

app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');

app.use(express.json('application/json'))
app.use('/', getRoutes);
app.use('/', postRoutes);

app.use((req, res) => {
    res.redirect("/")
})
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})


/* const cron = require('node-cron');*/


var { getRelativeTime, formatDate2, createDate } = require('./utils/dateFunctions');
app.locals.getRelativeTime = getRelativeTime;
app.locals.createDate = createDate;
app.locals.formatDate2 = formatDate2;
app.locals.hasUnreadNotifications = false

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