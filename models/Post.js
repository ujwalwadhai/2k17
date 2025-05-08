const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 512
  },
  imageUrl: {
    type: String,
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: String
    // default: Date.now
  },
  updatedAt: {
    type: String
    // default: Date.now
  }
});

module.exports = mongoose.model('Posts', postSchema);
