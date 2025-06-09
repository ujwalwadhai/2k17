var Files = require('../../models/Files');

var fetchComments = async (req, res) => {
    try {
        var file = await Files.findById(req.params.fileId)
          .populate('comments.user', 'name username profile');
        if(!file) return res.status(404).json({ message: 'File not found' });
        if(file.comments){
            file?.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }
        res.json(file.comments || []);
      } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Failed to fetch comments' });
      }
}

module.exports = fetchComments;