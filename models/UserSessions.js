const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSessionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'Users', index: true },
    sessionId: { type: String, index: true },
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number, default: 0 }
});

module.exports = mongoose.model('UserSessions', userSessionSchema);