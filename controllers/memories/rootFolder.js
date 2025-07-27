var Folders = require('../../models/Folders');
var Files = require('../../models/Files');

var rootFolder = async (req, res) => {
    try {
        const subfolders = await Folders.find({
            parent: null,
            $or: [
                { access: 'both' },
                { access: req.user?.gender }
            ]
        });
        var files = await Files.find({ folder: null }).populate('likes', '_id name username profile');
        var featuredImages = await Files.find({
            tags: 'featured'
        }).populate('likes', '_id name username profile')
        res.json({ success: true, folder: null, subfolders, files, breadcrumb: [], featuredImages, currentFolder: null, userId: req.user?._id || null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = rootFolder;