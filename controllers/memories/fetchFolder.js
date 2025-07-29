var Folders = require('../../models/Folders');
var Files = require('../../models/Files');
var PageViews = require('../../models/PageViews');

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
    var userGender = req.user?.gender;
    if (folder.access !== userGender && folder.access !== 'both') {
      return res.status(403).json({ success: false, message: 'Access Denied' });
    }
    const subfolders = await Folders.find({
      parent: folderId,
      $or: [
        { access: 'both' },
        { access: userGender }
      ]
    });
    var files = await Files.find({ folder: folderId }).populate('likes', '_id name username profile');
    var breadcrumb = await getBreadcrumb(folderId);
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' });
    await PageViews.findOneAndUpdate(
      { route: `/memories/folder/${folderId}`, date },
      { $inc: { visits: 1 } },
      { upsert: true }
    );
    res.json({ success: true, currentFolder: folder, subfolders, files, breadcrumb, userId: req.user?._id || null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = fetchFolder;