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

    // In-app notification logic
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

    // Push notification logic
    const targetUser = await Users.findById(post.author._id).select('pushSubscriptions');
      if (targetUser && targetUser.pushSubscriptions && targetUser.pushSubscriptions.length > 0) {
        const pushPayload = JSON.stringify({
          title: `${req.user.name} commented on your post`,
          body: `${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}`,
          icon: req.user.profile || '/images/web_logo.png',
          url: `/posts/${post._id}#comment-${newComment._id}`,
          tag: `comment-${newComment._id}`
        });

        targetUser.pushSubscriptions.forEach(subscription => {
          webpush.sendNotification(subscription, pushPayload)
            .then(() => console.log('Push notification sent to:', subscription.endpoint))
            .catch(async (error) => {
              console.error('Error sending push notification, subscription: ', subscription.endpoint, error.statusCode, error.body);
              // If subscription is no longer valid (e.g., 404, 410), remove it
              if (error.statusCode === 404 || error.statusCode === 410) {
                console.log('Subscription expired or invalid. Removing...');
                targetUser.pushSubscriptions = targetUser.pushSubscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
                await targetUser.save().catch(saveErr => console.error("Error saving user after removing subscription", saveErr));
              }
            });
        });
      }
    res.json({ success: true, commentsLength: post.comments.length, message: 'Comment added' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
}

module.exports = newComment;