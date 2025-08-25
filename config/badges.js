const Users = require('../models/Users');
const Posts = require('../models/Posts');
const Notifications = require('../models/Notifications');
const Badges = require('../models/Badges');
const logActivity = require('../utils/log');

async function awardBadge(user, badgeId) {
  const badge = await Badges.findOne({ badgeId });
  // Check if the badge exists and if the user doesn't already have it
  if (badge && !user.earnedBadges.some(b => b.badge._id.equals(badge._id))) {
    user.earnedBadges.push({ badge: badge._id });
    await user.save();
    logActivity(user._id, `Awarded badge '${badgeId}' to ${user.username}`);
    await Notifications.create({
      user: user._id,
      type: 'badge',
      icon: badge.icon,
      message: `You got ${badge.name} badge! 🎉`,
      url: `/badges`
    })
  }
}

async function checkAndAwardBadges(userId, action) {
  const user = await Users.findById(userId).populate('earnedBadges.badge');
  if (!user) return;

  const hasBadge = (id) => user.earnedBadges.some(b => b.badge.badgeId === id);

  switch (action) {
    case 'CREATED_POST':
      if (!hasBadge('first-post')) {
        await awardBadge(user, 'first-post');
      }
      break;

    case 'FIRST_COMMENT':
      if (!hasBadge('first-comment')) {
        await awardBadge(user, 'first-comment');
      }
      break;

    case 'new-account':
      if (!hasBadge('new-account')) {
        await awardBadge(user, 'new-account');
      }
      break;

    case 'profile-pic':
      if (!hasBadge('profile-pic')) {
        await awardBadge(user, 'profile-pic');
      }
      break;

    case 'profile-bio':
      if (!hasBadge('profile-bio')) {
        await awardBadge(user, 'profile-bio');
      }
      break;

    case 'profile-any':
      if (!hasBadge('profile-any')) {
        await awardBadge(user, 'profile-any');
      }
      break;

    case 'festive-spirit':
      if (!hasBadge('festive-spirit')) {
        await awardBadge(user, 'festive-spirit');
      }
      break;
  }
}

module.exports = { checkAndAwardBadges };