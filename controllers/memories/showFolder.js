var Folders = require('../../models/Folders')
var Files = require('../../models/Files')

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

var showFolder = async (req, res) => {
    var { folderId } = req.params
    //var userGender = req.user.gender

    var folder = folderId ? await Folders.findById(folderId) : null
    if (folder && folder.access !== 'both') {
        return res.redirect('/access-denied')
    }

    if (!folder) return res.redirect('/memories')

    var subfolders = await Folders.find({
        parent: folderId,
        access: 'both'
    })

    var files = await Files.find({
        folder: folderId || null
    })

    var featuredImages = await Files.find({
        tags: 'featured'
    })

    var breadcrumb = await getBreadcrumb(folderId) || []

    res.render('pages/memories', {
        currentFolder: folder,
        folders: subfolders,
        files,
        tab: 'drive',
        featuredImages,
        breadcrumb
    })
}

module.exports = showFolder