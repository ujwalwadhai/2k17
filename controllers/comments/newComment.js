var Posts = require('../../models/Posts');
var Users = require('../../models/Users');
var Notifications = require('../../models/Notifications');
var sendPushNotification = require('../../utils/push');

const newComment = async (req, res) => {
  try {
    var post = await Posts.findById(req.params.postId).populate('author', 'name email');
    var newCommentData = post.comments.create({
      user: req.user._id,
      text: req.body.text
    });
    if (post.comments) {
      post.comments.push(newCommentData);
    } else {
      post.comments = []
      post.comments.push(newCommentData);
    }
    await post.save();

    // In-app notification logic
    if(post.author._id.toString() !== req.user._id.toString()){
      var notification = new Notifications({
        user: post.author._id,
        type: 'comment',
        fromUser: req.user._id,
        message: `commented on your post.`,
        url: `/post/${post._id}`
      })
      await notification.save();
    }

    await sendPushNotification({
      userId: post.author._id,
      type: 'comment',
      data: {
        user: req.user,
        text: req.body.text,
        postId: post._id,
        commentId: newCommentData._id
      }
    });
    res.json({ success: true, commentsLength: post.comments.length, message: 'Comment added' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
}

module.exports = newComment;