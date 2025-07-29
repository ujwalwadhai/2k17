var Posts = require('../../models/Posts');

const fetchComments = async (req, res) => {
  try {
    var post = await Posts.findById(req.params.postId)
      .populate('comments.user', 'name username profile');
    post.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json(post.comments);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

module.exports = fetchComments