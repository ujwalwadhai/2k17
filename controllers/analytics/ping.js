const ActiveUsers = require('../../models/ActiveUsers');
const PageViews = require('../../models/PageViews');
const DailyUsers = require('../../models/DailyUsers');
const Users = require('../../models/Users');
const Posts = require('../../models/Posts');
const Folders = require('../../models/Folders');

var ping = async (req, res) => {
    let payload;
    try {
        payload = JSON.parse(req.body);
    } catch (err) {
        return res.sendStatus(400);
    }

    const { user, session_id, current_route, initial, admin, platform } = payload;
    const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' });

    if (admin) {
        await DailyUsers.deleteMany({ session_id });
    }

    if (!session_id || !current_route) return res.sendStatus(400);

    if (user) {
        const userDoc = await Users.findById(user).select('role');
        if (!userDoc || userDoc.role === 'admin') {
            await DailyUsers.deleteMany({ date, session_id });
            return res.sendStatus(204);
        }
    }

    const ignoredRoutes = ['/api/', '/admin', '/analytics'];
    if (ignoredRoutes.some(prefix => current_route.startsWith(prefix))) {
        return res.sendStatus(204);
    }

    const updateFields = {
        user: user || null,
        session_id,
        current_route,
        last_ping: new Date(),
    };

    await ActiveUsers.findOneAndUpdate(
        { session_id },
        { $set: updateFields },
        { upsert: true }
    );

    if (initial) {
        if (/^\/post\/[a-fA-F0-9]{24}$/.test(current_route)) {
            const postId = current_route.split('/')[2];
            await Posts.findByIdAndUpdate(postId, { $inc: { visits: 1 } });
        } else if (/^\/[a-zA-Z0-9_]+$/.test(current_route)) {
            const username = current_route.slice(1);
            const userExists = await Users.exists({ username });
            if (userExists) {
                // To track profile views, add code here
                return res.sendStatus(200);
            } else {
                await PageViews.findOneAndUpdate(
                    { route: current_route, date },
                    { $inc: { visits: 1 } },
                    { upsert: true }
                );
            }
        } else {
            await PageViews.findOneAndUpdate(
                { route: current_route, date },
                { $inc: { visits: 1 } },
                { upsert: true }
            );
        }

        if (user) {
            const hasUserEntry = await DailyUsers.countDocuments({ date, session_id });
            if (!hasUserEntry) {
                await DailyUsers.updateOne(
                    { date, session_id, user, platform },
                    { $setOnInsert: { createdAt: new Date() } },
                    { upsert: true }
                );
            }

            await DailyUsers.deleteMany({ date, session_id, user: null });
        } else {
            const hasGuestEntry = await DailyUsers.countDocuments({ date, session_id });
            const hadKnownUser = await DailyUsers.findOne({ date, session_id, user: { $ne: null } });
            if (hasGuestEntry == 0 && !hadKnownUser) {
                await DailyUsers.updateOne(
                    { date, session_id, user: null, platform },
                    { $setOnInsert: { createdAt: new Date() } },
                    { upsert: true }
                );
            }
        }
    }

    res.sendStatus(200);
}

module.exports = ping;
