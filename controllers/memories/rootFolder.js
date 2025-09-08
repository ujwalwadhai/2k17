var Folders = require('../../models/Folders');
var Files = require('../../models/Files');

var rootFolder = async (req, res) => {
    try {
        const subfolders = await Folders.find({
            parent: null,
            $and: [
                {
                    $or: [
                        { access: 'both' },
                        { access: req.user.gender }
                    ]
                },
                {
                    $or: [
                        { shared: null },
                        { shared: { $in: [req.user?._id] } }
                    ]
                }
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