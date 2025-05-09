const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

const getRoutes = require('./routes/getRoutes');
const postRoutes = require('./routes/postRoutes');

require('./models/User')
require('./models/Comment')
require('./models/Like')
require('./models/Post')
require('./models/Notifications')
require('./models/UserSettings')
require('./models/PreUser')

dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', getRoutes);
app.use('/', postRoutes);

// Utility functions for frontend
var { formatDate, createDate, getWeekDay } = require('./utils/dateFunctions');
app.locals.formatDate = formatDate;
app.locals.createDate = createDate;
app.locals.getWeekDay = getWeekDay;

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
