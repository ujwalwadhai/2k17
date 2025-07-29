var Files = require('../../models/Files');

const deleteComment = async (req, res) => {
  var { fileId, commentId } = req.params;
  var userId = req.user._id;

  try {
    var file = await Files.findById(fileId);
    if (!file) return res.status(404).json({ success: false, message: 'file not found' });

    var comment = file.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (String(comment.user._id) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    file.comments = file.comments.filter(comment => comment._id.toString() !== commentId);
    await file.save();
    res.json({ commentsLength: file.comments.length, success: true, message: 'Comment deleted' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = deleteComment;