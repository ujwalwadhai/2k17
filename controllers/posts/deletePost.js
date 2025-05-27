var Posts = require('../../models/Posts');
var { destroy } = require('../../config/cloudinary');
var logActivity = require('../../utils/log');

const deletePost = async (req, res) => {
  try {
    var post = await Posts.findById(req.body.postId);
    if (!post) {
      return res.json({ success: false, message: 'Post not found' });
    }
    if (String(post.author) === String(req.user._id)) {
      return res.json({ success: false, message: 'You cannot delete this post' });
    }
    if(post.media?.url) await destroy(post.media.url, post.media.type);
    await Posts.findByIdAndDelete(req.body.postId);
    logActivity(req.user._id, 'Post Delete', `Deleted a post`);
    return res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Failed to delete post' });
  }
}

module.exports = deletePost;