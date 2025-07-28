const Files = require("../../models/Files");

const tagFile = async (req, res) => {
    if (req.user) {
        var file = await Files.findOne({ _id: req.params.fileId })
        if(file.people && file.people.includes(req.user._id)) {
            await Files.findOneAndUpdate({ _id: req.params.fileId }, { $pull: { people: req.user._id } })
            return res.json({ success: true, tag: false })
        }
        await Files.findOneAndUpdate({ _id: req.params.fileId }, { $push: { people: req.user._id } })
        return res.json({ success: true, tag: true })
    }
    return res.json({ success: false, message: "You are not logged in" })
}

module.exports = tagFile;