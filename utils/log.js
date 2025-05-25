var Logs = require('../models/Logs');

async function logActivity(userId, action, detail = '') {
  try {
    await Logs.create({
      user: userId,
      action,
      detail
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

module.exports = logActivity;
