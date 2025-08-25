var Posts = require('../../models/Posts');
var Users = require('../../models/Users');
var Notifications = require('../../models/Notifications');
var sendMail = require('../../config/mailer')
var sendPushNotification = require('../../utils/push');
const { checkAndAwardBadges } = require('../../config/badges');

const newComment = async (req, res) => {
  try {
    var post = await Posts.findById(req.params.postId).populate('author', 'name email');

    let rawText = req.body.text || '';

    const mentionRegex = /@([a-zA-Z0-9_]{1,20})/g;
    const mentionedUsernames = [...new Set([...rawText.matchAll(mentionRegex)].map(m => m[1]))];

    const isMentionAll = mentionedUsernames.includes('all');
    const realUsernames = mentionedUsernames.filter(u => u !== 'all');

    const mentionedUsers = await Users.find({
      username: { $in: realUsernames }
    }).select('username');

    const validUsernames = mentionedUsers.map(u => u.username);
    const validUsersId = mentionedUsers.map(u => u._id);

    const processedText = rawText.replace(mentionRegex, (match, username) => {
      if (username === 'all') {
        return `<a href="/members" class="mention-link">@all</a>`;
      } else if (validUsernames.includes(username)) {
        return `<a href="/${username}" class="mention-link">@${username}</a>`;
      } 
      return match;
    });

    var newCommentData = post.comments.create({
      user: req.user._id,
      text: processedText
    });
    if (validUsersId.length > 0) {
      newCommentData.mentions = validUsersId;
    }

    if (isMentionAll) {
      var notification = new Notifications({
        user: null,
        type: 'mention',
        fromUser: req.user._id,
        message: `mentioned you in a comment.`,
        url: `/post/${post._id}`
      })
      await notification.save();
    } else {
      for (let i = 0; i < validUsersId.length; i++) {
        var user = await Users.findById(validUsersId[i]);
        var notification = new Notifications({
          user: validUsersId[i],
          type: 'mention',
          fromUser: req.user._id,
          message: `mentioned you in a comment.`,
          url: `/post/${post._id}`
        })
        await notification.save();
        await sendPushNotification({
          userId: user._id,
          type: 'mention',
          data: {
            user: req.user,
            text: rawText || "Click to see",
            postId: post._id,
          }
        });
        if (user.email) await sendMail('comment_mention', user.email, { name: user.name.split(' ')[0], username: req.user.username, url: `https://twok17.onrender.com/post/${post._id}` })
      }
    }

    if (post.comments) {
      post.comments.push(newCommentData);
    } else {
      post.comments = []
      post.comments.push(newCommentData);
    }

    await post.save();
    await checkAndAwardBadges(req.user.id, 'FIRST_COMMENT');

    // In-app notification logic
    if (post.author._id.toString() !== req.user._id.toString()) {
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