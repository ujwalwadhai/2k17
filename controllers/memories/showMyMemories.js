const Files = require('../../models/Files');

const showMyMemories = async (req, res) => {
    res.render('pages/memories', {
        currentFolder: {
            name: "My Memories"
        },
        userId: req?.user?._id || null
    })
}

module.exports = showMyMemories;