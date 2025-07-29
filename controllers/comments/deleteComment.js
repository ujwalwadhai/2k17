var Posts = require('../../models/Posts');

const deleteComment = async (req, res) => {
  var { postId, commentId } = req.params;
  var userId = req.user._id;

  try {
    var post = await Posts.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    var comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (String(comment.user._id) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);
    await post.save();
    res.json({ commentsLength: post.comments.length, success: true, message: 'Comment deleted' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = deleteComment;