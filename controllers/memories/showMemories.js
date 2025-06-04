var Folders = require('../../models/Folders');
var Files = require('../../models/Files');

const showMemories = async (req, res) => {

  var subfolders = await Folders.find({
    parent: null,
    access: 'both'
  })

  var files = await Files.find({
    folder: null,
    visible: true
  })

  var featuredImages = await Files.find({
    tags: 'featured'
  })

  var breadcrumb = []

  res.render('pages/memories', {
    featuredImages,
    folders: subfolders,
    files,
    breadcrumb,
    tab: '',
    currentFolder: null
  })
}

module.exports = showMemories;