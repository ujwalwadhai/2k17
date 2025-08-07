const cron = require('node-cron');
const ActiveUsers = require('../models/ActiveUsers');
const UserSessions = require('../models/UserSessions');

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

cron.schedule('*/10 * * * *', async () => {
    
    try {
        const cutoffTime = new Date(Date.now() - INACTIVITY_TIMEOUT_MS);

        const inactiveSessions = await ActiveUsers.find({ last_ping: { $lt: cutoffTime }, startTime: { $exists: true } });

        if (inactiveSessions.length === 0) {
            return;
        }

        for (const activeSession of inactiveSessions) {
            const duration = Math.round(
                (activeSession.last_ping.getTime() - activeSession.startTime.getTime()) / 1000
            );

            const exists = await UserSessions.countDocuments({ sessionId: activeSession.session_id });

            if(exists > 0) return

            const completedSession = new UserSessions({
                user: activeSession.user,
                sessionId: activeSession.session_id,
                startTime: activeSession.startTime,
                endTime: activeSession.last_ping,
                duration
            });
            await completedSession.save();
        }

    } catch (error) {
        console.error('Error in session closing cron job:', error);
    }
});

module.exports = cron;