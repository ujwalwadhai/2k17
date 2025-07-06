var Posts = require('../../models/Posts');
var Notifications = require('../../models/Notifications');
var sendPushNotification = require('../../utils/push');

const likePost = async (req, res) => {
  var userId = req.user._id;
  var { postId } = req.params;

  try {
    var post = await Posts.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    var alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    if (post.author.toString() !== userId.toString() && !alreadyLiked) {
      var notification = new Notifications({
        user: post.author,
        type: 'like',
        fromUser: userId,
        message: `liked your post.`,
        url: `/post/${post._id}`
      })
      await notification.save();
      await sendPushNotification({
        userId: post.author._id,
        type: 'like',
        data: {
          user: req.user,
          postId: post._id
        }
      });
    }

    res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: post.likes.length
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = likePost;