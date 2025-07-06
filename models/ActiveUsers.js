const mongoose = require('mongoose');
const Posts = require('./Posts');

const activeUserSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
  session_id: { type: String, required: true },
  current_route: { type: String, required: true },
  last_ping: { type: Date, default: Date.now }
});

activeUserSchema.index({ session_id: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

module.exports = mongoose.model('ActiveUsers', activeUserSchema);