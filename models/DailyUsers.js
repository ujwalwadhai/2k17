const mongoose = require('mongoose');

const dailyUserSchema = new mongoose.Schema({
  date: { type: String, required: true },
  session_id: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
  createdAt: { type: Date, default: Date.now },
  platform: { type: String }
});

dailyUserSchema.index({ date: 1, user: 1 }, { unique: true, partialFilterExpression: { user: { $ne: null } } });
dailyUserSchema.index({ date: 1, session_id: 1 }, { unique: true, partialFilterExpression: { user: null } });

module.exports = mongoose.model('DailyUsers', dailyUserSchema);
