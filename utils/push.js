const webpush = require('web-push');
const Users = require('../models/Users');
const Settings = require('../models/Settings');

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const webPushContactEmail = process.env.WEB_PUSH_CONTACT_EMAIL;

if (!vapidPublicKey || !vapidPrivateKey || !webPushContactEmail) {
  console.error("VAPID keys or contact email not set. Please generate VAPID keys and set them in your environment variables.");
} else {
  webpush.setVapidDetails(
    `mailto:${webPushContactEmail}`,
    vapidPublicKey,
    vapidPrivateKey
  );
}

// Push notification templates
const templates = {
  comment: (data) => ({
    title: `${data.user.username} commented on your post`,
    body: `"${data.text?.substring(0, 50)}${data.text?.length > 50 ? '...' : ''}"`,
    icon: data.user.profile || '/images/web_logo.png',
    url: `/post/${data.postId}#comment-${data.commentId}`,
    tag: `comment`
  }),
  mention: (data) => ({
    title: `${data.user.username} mentioned you in a post`,
    body: `"${data.text?.substring(0, 50)}${data.text?.length > 50 ? '...' : ''}"`,
    icon: data.user.profile || '/images/web_logo.png',
    url: `/post/${data.postId}`,
    tag: `mention`
  }),
  like: (data) => ({
    title: `${data.user.username} liked your post`,
    body: `Click to see.`,
    icon: data.user.profile || '/images/web_logo.png',
    url: `/post/${data.postId}`,
    tag: `like`
  }),
  postreact: (data) => ({
    title: `${data.user.username} reacted ${data.reaction} to your post.`,
    body: `Click to see.`,
    icon: data.user.profile || '/images/web_logo.png',
    url: `/post/${data.postId}`,
    tag: `postreact`
  }),
  admin: (data) => ({
    title: data.title,
    body: data.body,
    icon: '/images/web_logo.png',
    badge: '/images/icons/logo_72x72.png',
    url: data.url || '/',
    tag: 'admin-msg'
  }),
  loginAlert: (data) => ({
    title: 'New login to your account',
    body: `Login from ${data.location || 'unknown location'}`,
    icon: '/images/web_logo.png',
    url: '/account?t=loggedInDevices',
    tag: 'login'
  })
};

async function sendPushNotification({ userId, type, data = {} }) {
  if (!templates[type]) return;

  let users = [];

  if (userId) {
    const settings = await Settings.findOne({ user: userId }).select('notifications.push');
    if (!settings?.notifications?.push) return;

    const user = await Users.findById(userId).select('pushSubscriptions');
    if (user?.pushSubscriptions?.length) {
      users.push({ _id: userId, pushSubscriptions: user.pushSubscriptions });
    }
  } else {
    const allSettings = await Settings.find({ 'notifications.push': true }).select('user');
    const userIds = allSettings.map(s => s.user);

    users = await Users.find({
      _id: { $in: userIds },
      pushSubscriptions: { $exists: true, $not: { $size: 0 } }
    }).select('pushSubscriptions');
  }

  const notificationPayload = JSON.stringify(templates[type](data));

  for (const user of users) {
    const validSubs = [];

    for (const sub of user.pushSubscriptions) {
      try {
        await webpush.sendNotification(sub, notificationPayload);
        validSubs.push(sub);
      } catch (err) {
        if (![404, 410].includes(err.statusCode)) validSubs.push(sub);
      }
    }

    if (validSubs.length !== user.pushSubscriptions.length) {
      await Users.updateOne(
        { _id: user._id },
        { $set: { pushSubscriptions: validSubs } }
      ).catch(e => console.error('Failed to update subscriptions', e));
    }
  }
}

module.exports = sendPushNotification;
