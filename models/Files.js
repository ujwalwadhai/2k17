const mongoose = require('mongoose');
const { getRelativeTime } = require('../utils/time');

var commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  text: String,
  createdAt: { type: Date, default: Date.now }
})

const fileSchema = new mongoose.Schema({
  name: String,
  url: {
    type: String,
    required: true
  },
  gid: {
    type: String,
    required: true
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folders',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['image', 'video', 'other']
  },
  path: String,
  tags: [String],
  people: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    default: []
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }],
  thumbnail: String,
  comments: [commentSchema]
})

commentSchema.virtual('timeAgo').get(function () {
  return getRelativeTime(this.createdAt);
});
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true })

const Files = mongoose.model('Files', fileSchema);

module.exports = Files