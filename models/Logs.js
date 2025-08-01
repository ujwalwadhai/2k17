const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: false
  },
  activity: {
    type: String
  },
  system: {
    type: Boolean
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  data: Object
});

module.exports = mongoose.model('Logs', activityLogSchema);
