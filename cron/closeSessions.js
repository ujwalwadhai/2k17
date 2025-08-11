const cron = require('node-cron');
const ActiveUsers = require('../models/ActiveUsers');
const UserSessions = require('../models/UserSessions');

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;

cron.schedule('*/8 * * * *', async () => {
    try {
        const cutoffTime = new Date(Date.now() - INACTIVITY_TIMEOUT_MS);

        const inactiveSessions = await ActiveUsers.find({ last_ping: { $lt: cutoffTime }});

        if (inactiveSessions.length === 0) {
            return;
        }

        for (const activeSession of inactiveSessions) {
            try {
                const duration = Math.round(
                    (activeSession.last_ping.getTime() - activeSession.startTime.getTime()) / 1000
                );

                const completedSession = new UserSessions({
                    user: activeSession.user,
                    sessionId: activeSession.session_id,
                    startTime: activeSession.startTime,
                    endTime: activeSession.last_ping,
                    duration
                });
                await completedSession.save();

                await ActiveUsers.findByIdAndDelete(activeSession._id);

            } catch (loopError) {
                console.error(`Failed to process session ${activeSession.session_id}:`, loopError);
                continue;
            }
        }
    } catch (error) {
        console.error('Error in session archiving cron job:', error);
    }
});

module.exports = cron;