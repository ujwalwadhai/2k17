const Files = require("../../models/Files");

const myMemories = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, error: "User not authenticated" });
        const memories = await Files.find({ people: req.user._id }).populate('likes', '_id name username profile');
        var currentFolder = { name: "My Memories" }
        res.json({ success: true, files: memories, subfolders: [], currentFolder, userId: req.user.id, breadcrumb: [] });
    } catch (error) {
        res.status(500).json({ error: "Error fetching memories" });
    }
}

module.exports = myMemories;