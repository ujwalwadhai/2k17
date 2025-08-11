var Logs = require('../models/Logs');

async function logActivity(userId, activity = '', data={}) {
  try {
    if(process.env.PLATFORM_TYPE == 'developement') return
    if(req?.user?.role === 'admin') return
    if(!userId) {
      await Logs.create({
        activity,
        system: true,
        data,
        createdAt: new Date()
      });
    } else {
      await Logs.create({
        user: userId,
        activity,
        createdAt: new Date(),
    });
    }
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

module.exports = logActivity;
