const DailyUsers = require('../../models/DailyUsers');
const UserSessions = require('../../models/UserSessions');
const { startOfDay, endOfDay } = require('../../utils/time');

const dayAnalytics = async (req, res) => {
    let date = new Date();

    if (req.params.date) {
        const parts = req.params.date.split('-');
        const isoDateString = `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`;
        if (new Date(isoDateString) > new Date()) {
            return res.status(400).json({ error: 'Invalid date. Please use a past date.' });
        }
        date = new Date(isoDateString);
    }

    if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Please use dd-mm-yyyy.' });
    }

    const users = await DailyUsers.find({
        createdAt: {
            $gte: startOfDay(date),
            $lte: endOfDay(date)
        },
        user: { $exists: true, $ne: null }
    }).populate("user", "name username"); 

    const guests = await DailyUsers.countDocuments({
        createdAt: {
            $gte: startOfDay(date),
            $lte: endOfDay(date)
        },
        user: { $eq: null }
    })

    const allusers = {
        guests,
        users
    }

    const platform_data = await DailyUsers.aggregate([
        { $match: { createdAt: { $gte: startOfDay(date), $lte: endOfDay(date) } } },
        {
            $group: {
                _id: '$platform',
                count: { $sum: 1 }
            }
        }
    ]);

    const platform_breakdown = platform_data.reduce((acc, cur) => {
        acc[cur._id || 'unknown'] = cur.count;
        return acc;
    }, {});

    const sessionData = await UserSessions.aggregate([
        {
            $match: {
                startTime: {
                    $gte: startOfDay(date),
                    $lte: endOfDay(date)
                }
            }
        },
        {
            $group: {
                _id: null,
                collectiveTime: { $sum: '$duration' },
                avgTime: { $avg: '$duration' },
                count: { $sum: 1 }
            }
        }
    ]);

    let finalSessionData;

    if (sessionData.length > 0) {
        finalSessionData = {
            avgTime: (sessionData[0].avgTime / 60).toFixed(2),
            collectiveTime: (sessionData[0].collectiveTime / 60).toFixed(2),
            count: sessionData[0].count
        };
    } else {
        finalSessionData = { collectiveTime: 0, avgTime: 0, count: 0 };
    }

    res.render('pages/admin/dayAnalytics', { allusers, date, sessionData: finalSessionData, platform_data: platform_breakdown });
}

module.exports = dayAnalytics