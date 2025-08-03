const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    _id: String,
    session: String,
    expires: Date
}, {
    collection: 'sessions'
});

const Sessions = mongoose.model('Sessions', sessionSchema, 'sessions');

module.exports = Sessions;