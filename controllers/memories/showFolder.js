var Folders = require('../../models/Folders');
var Files = require('../../models/Files');

var showFolder = async (req, res) => {
    var { folderId } = req.params
    var folder = folderId !== 'undefined' ? await Folders.findById(folderId) : null

    if (!folder) return res.redirect('/memories')

    if (folder.access !== req?.user?.gender && folder.access !== 'both') {
        return res.status(403).json({ success: false, message: 'Access Denied' });
    }
    
    var featuredImages = await Files.find({
        tags: 'featured'
    }).populate('likes', '_id name username profile')

    res.render('pages/memories', {
        currentFolder: folder,
        tab: 'drive',
        featuredImages,
        userId: req?.user?._id || null
    })
}

module.exports = showFolder