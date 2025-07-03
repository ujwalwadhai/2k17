var Folders = require('../../models/Folders');
var Files = require('../../models/Files');

const showMemories = async (req, res) => {

  var subfolders = await Folders.find({
    parent: null,
    access: 'both'
  })

  var files = await Files.find({
    folder: null
  }).populate('likes', '_id name username profile')

  var featuredImages = await Files.find({
    tags: 'featured'
  }).populate('likes', '_id name username profile')

  var breadcrumb = []

  res.render('pages/memories', {
    featuredImages,
    folders: subfolders,
    files,
    breadcrumb,
    tab: '',
    currentFolder: null, 
    userId: req?.user?._id || null
  })
}

module.exports = showMemories;