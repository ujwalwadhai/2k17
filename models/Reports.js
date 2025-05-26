const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: false
  },
  subject: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  resolution: {
    type: String,
    required: false
  }
}, {timestamps: true});

module.exports = mongoose.model('Reports', reportSchema);
