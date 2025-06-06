var Folders = require('../../models/Folders');

var showFolder = async (req, res) => {
    var { folderId } = req.params
    //var userGender = req.user.gender

    var folder = folderId !== 'undefined' ? await Folders.findById(folderId) : null
    if (folder && folder.access !== 'both') {
        return res.redirect('/access-denied')
    }

    if (!folder) return res.redirect('/memories')

    res.render('pages/memories', {
        currentFolder: folder ,
        tab: 'drive'
    })
}

module.exports = showFolder