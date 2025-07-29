var Posts = require('../../models/Posts');
var { destroy } = require('../../config/cloudinary');
var logActivity = require('../../utils/log');

const deletePost = async (req, res) => {
  try {
    var post = await Posts.findById(req.body.postId);
    if (!post) {
      return res.json({ success: false, message: 'Post not found' });
    }
    if(post.author !== req.user._id && req.user.role !== 'admin') {
      return res.json({ success: false, message: 'You are not authorized to delete this post' });
    }

    if(String(post.author._id) === String(req.user._id)) {
      if(post.media?.url) await destroy(post.media.url, post.media.type);
      await Posts.deleteOne({ _id: req.body.postId });
      logActivity(req.user._id, 'Post Delete', `Deleted a post`);
      return res.json({ success: true, message: 'Post deleted' });
    } else {
      await Posts.findByIdAndUpdate(req.body.postId, { deleted: true });
      logActivity(req.user._id, 'Post Delete', `Admin deleted a post`);
      return res.json({ success: true, message: 'Post deleted' });
    }
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Failed to delete post' });
  }
}

module.exports = deletePost;