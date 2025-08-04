var Folders = require('../../models/Folders');
var Files = require('../../models/Files');

let cachedFeaturedImages = []
let cachedFolders = []

const refreshCache = async () => {
  try {
    var featuredImages = await Files.find({
      tags: 'featured'
    }).populate('likes', '_id name username profile')

    var subfolders = await Folders.find({
      parent: null,
      access: 'both'
    })

    cachedFeaturedImages = featuredImages
    cachedFolders = subfolders

  } catch (err) {
    console.error('Failed to refresh cache:', err);
  }
};

setInterval(refreshCache, 3600000 * 12);

refreshCache();

const showMemories = async (req, res) => {

  var breadcrumb = []

  res.render('pages/memories', {
    featuredImages: cachedFeaturedImages,
    folders: cachedFolders,
    files: [],
    breadcrumb,
    tab: '',
    currentFolder: null,
    userId: req?.user?._id || null
  })
}

module.exports = showMemories;