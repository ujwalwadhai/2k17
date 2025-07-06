var Folders = require('../../models/Folders');
var Files = require('../../models/Files');

var showFile = async (req, res) => {
    var { fileId } = req.params
    var file = fileId !== 'undefined' ? await Files.findById(fileId) : null

    if (!file) return res.redirect('/memories')
    var folder = await Folders.findById(file.folder)

    var featuredImages = await Files.find({
        tags: 'featured'
    }).populate('likes', '_id name username profile')

    res.render('pages/viewFile', {
        file,
        userId: req?.user?._id || null
    })
}

module.exports = showFile