const Posts = require('../../models/Posts');
const Users = require('../../models/Users');
const Notifications = require('../../models/Notifications');
var sendMail = require('../../config/mailer')
const logActivity = require('../../utils/log'); 
const sendPushNotification = require('../../utils/push');
const { checkAndAwardBadges } = require('../../config/badges');

const newPost = async (req, res) => {
  try {
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

    const newPostData = {
      author: req.user._id,
      text: processedText,
      likes: [req.user._id],
      comments: []
    };

    if (validUsersId.length > 0) {
      newPostData.mentions = validUsersId;
    }

    if (req.file) {
      newPostData.media = {
        url: req.file.path,
        type: req.file.mimetype
      };
    }

    const newPost = new Posts(newPostData);
    await newPost.save();

    if (isMentionAll) {
      var notification = new Notifications({
        user: null,
        type: 'mention',
        fromUser: req.user._id,
        message: `mentioned you in a post.`,
        url: `/post/${newPost._id}`
      })
      await notification.save();
    } else {
      for (let i = 0; i < validUsersId.length; i++) {
        var user = await Users.findById(validUsersId[i]);
        var notification = new Notifications({
          user: validUsersId[i],
          type: 'mention',
          fromUser: req.user._id,
          message: `mentioned you in a post.`,
          url: `/post/${newPost._id}`
        })
        await notification.save();
        await sendPushNotification({
          userId: user._id,
          type: 'mention',
          data: {
            user: req.user,
            text: rawText || "Click to see",
            postId: newPost._id,
          }
        });
        if (user.email) await sendMail('post_mention', user.email, { name: user.name.split(' ')[0], username: req.user.username, url: `https://the2k17.in/post/${newPost._id}` })
      }
    }

    logActivity(req.user._id, `Created new post (${newPost._id})`);

    await checkAndAwardBadges(req.user.id, 'CREATED_POST');
    return res.json({ success: true, message: 'Post created' });

  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: 'Something went wrong' });
  }
};

module.exports = newPost;
