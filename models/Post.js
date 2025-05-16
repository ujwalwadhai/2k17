const mongoose = require('mongoose');
const { createDate } = require('../utils/dateFunctions');

const postSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 512
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
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
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

module.exports = mongoose.model('Posts', postSchema);
