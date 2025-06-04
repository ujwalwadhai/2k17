var Folders = require('../../models/Folders');
var Files = require('../../models/Files');

var rootFolder = async (req, res) => {
    try {
        var subfolders = await Folders.find({ parent: null });
        var files = await Files.find({ folder: null });
        var featuredImages = await Files.find({
            tags: 'featured'
        })
        res.json({ success: true, folder: null, subfolders, files, breadcrumb: [], featuredImages, currentFolder: null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = rootFolder;