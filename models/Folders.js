var mongoose = require('mongoose')

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  gid:{ // Google Drive ID
    type: String,
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folders',
    default: null
  },
  access: {
    type: String,
    enum: ['male', 'female', 'both'],
    default: 'both'
  },
  path: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Folders', folderSchema)