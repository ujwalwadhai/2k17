var Folders = require('../../models/Folders');
var Files = require('../../models/Files');

async function getBreadcrumb(folderId) {
  var breadcrumbs = []

  let current = await Folders.findById(folderId)

  while (current) {
    breadcrumbs.unshift({
      name: current.name,
      id: current._id
    })
    current = current.parent ? await Folders.findById(current.parent) : null
  }

  return breadcrumbs
}

var fetchFolder = async (req, res) => {
  var { folderId } = req.params;

  try {
    var folder = await Folders.findById(folderId);
    if (!folder) {
      return res.status(404).json({ success: false, message: 'Folder not found' });
    }
    var subfolders = await Folders.find({ parent: folderId });
    var files = await Files.find({ folder: folderId });
    var featuredImages = await Files.find({
      tags: 'featured'
    })
    var breadcrumb = await getBreadcrumb(folderId);
    res.json({ success: true, currentFolder: folder, subfolders, files, breadcrumb, featuredImages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = fetchFolder;