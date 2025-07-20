const mongoose = require('mongoose');
const { getRelativeTime } = require('../utils/time');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  text: String,
  createdAt: { type: Date, default: Date.now }
})

const postSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 1024
  },
  media:{
    url: String,
    type: {
      type: String
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  visits: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
  comments: [commentSchema],
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }]
});

function autoPopulateAuthor(next) {
  this.populate('author');
  next();
}

postSchema
  .pre('find', autoPopulateAuthor)
  .pre('findOne', autoPopulateAuthor)
  .pre('findOneAndUpdate', autoPopulateAuthor)
  .pre('findById', autoPopulateAuthor);

commentSchema.virtual('timeAgo').get(function () {
  return getRelativeTime(this.createdAt);
});

postSchema.virtual('timeAgo').get(function () {
  return getRelativeTime(this.createdAt);
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true })


module.exports = mongoose.model('Posts', postSchema);
 