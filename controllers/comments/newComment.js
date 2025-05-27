var Posts = require('../../models/Posts');
var Notifications = require('../../models/Notifications');
var sendMail = require('../../config/mailer');
var logActivity = require('../../utils/log');

const newComment = async (req, res) => {
  try {
    var post = await Posts.findById(req.params.postId).populate('author', 'name email');
    if (post.comments) {
      post.comments.push({
        user: req.user._id,
        text: req.body.text
      });
    } else {
      post.comments = []
      post.comments.push({
        user: req.user._id,
        text: req.body.text
      });
    }
    await post.save();
    if(post.author._id.toString() !== req.user._id.toString() && post.author.email){
      sendMail('newcomment', post.author.email, { user: req.user, comment: req.body.text, postLink: `${req.protocol}://${req.get('host')}/post/${post._id}` });
      var notification = new Notifications({
        user: post.author._id,
        type: 'comment',
        fromUser: req.user._id,
        message: `commented on your post.`,
        url: `/post/${post._id}`
      })
      await notification.save();
    }
    logActivity(req.user._id, 'Post Comment', `Commented on ${post.author.username}'s post (${post._id})`);
    res.json({ success: true, commentsLength: post.comments.length, message: 'Comment added' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
}

module.exports = newComment;