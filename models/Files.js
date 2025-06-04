const mongoose = require('mongoose');

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
  tags: [String]
})


module.exports = mongoose.model('Files', fileSchema);