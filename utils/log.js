var Logs = require('../models/Logs');

async function logActivity(userId, action, detail = '', data={}) {
  try {
    if(process.env.PLATFORM_TYPE == 'developement') return
    if(!userId) {
      await Logs.create({
        action,
        detail,
        system: true,
        data,
        createdAt: new Date()
      });
    } else {
      await Logs.create({
        user: userId,
        action,
        detail,
        createdAt: new Date(),
    });
    }
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

module.exports = logActivity;
