const cron = require('node-cron');
const DailyUsers = require('../models/DailyUsers');
const PageViews = require('../models/PageViews');
const Users = require('../models/Users');
const sendMail = require('../config/mailer');

const getMonthRange = (offset = 0) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + offset;

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return { start, end };
};

async function getMonthlyAnalyticsData() {
    try {
        const { start: currentStart, end: currentEnd } = getMonthRange(0);
        const { start: prevStart, end: prevEnd } = getMonthRange(-1);
        const currentMonthStr = new Date().toLocaleDateString('en-IN', {
            month: '2-digit',
            year: 'numeric',
            timeZone: 'Asia/Kolkata'
        });
        const prevMonthStr = new Date(prevStart).toLocaleDateString('en-IN', {
            month: '2-digit',
            year: 'numeric',
            timeZone: 'Asia/Kolkata'
        })

        const getStats = async (start, end) => {
            const result = await DailyUsers.aggregate([
                { $match: { createdAt: { $gte: start, $lte: end } } },
                {
                    $group: {
                        _id: '$session_id',
                        user: { $first: '$user' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        guests: { $sum: { $cond: [{ $eq: ['$user', null] }, 1, 0] } },
                        known: { $sum: { $cond: [{ $ne: ['$user', null] }, 1, 0] } }
                    }
                }
            ]);
            return result[0] || { total: 0, guests: 0, known: 0 };
        };

        const current = await getStats(currentStart, currentEnd);
        const previous = await getStats(prevStart, prevEnd);

        const calcChange = (curr, prev) =>
            prev === 0 ? (curr === 0 ? 0 : 100) : ((curr - prev) / prev) * 100;

        const platform_data = await DailyUsers.aggregate([
            { $match: { createdAt: { $gte: currentStart, $lte: currentEnd } } },
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

        const visitCount = await PageViews.aggregate([
            {
                $match: {
                    date: { $regex: `${currentMonthStr.replace('/', '\\/')}$` }
                }
            },
            {
                $group: {
                    _id: null,
                    totalVisits: { $sum: "$visits" }
                }
            }
        ]);

        const totalVisits = visitCount[0]?.totalVisits || 0;

        const prevVisitCount = await PageViews.aggregate([
            {
                $match: {
                    date: { $regex: `${prevMonthStr.replace('/', '\\/')}$` }
                }
            },
            {
                $group: {
                    _id: null,
                    totalVisits: { $sum: "$visits" }
                }
            }
        ]);

        const totalPrevVisits = prevVisitCount[0]?.totalVisits || 0;

        const visitChange = calcChange(totalVisits, totalPrevVisits);

        // Monthly top route
        const topRoute = await PageViews.aggregate([
            {
                $match: {
                    date: { $regex: `${currentMonthStr.replace('/', '\\/')}$` } // Matches 'dd/mm/yyyy' ending in current month
                }
            },
            {
                $group: {
                    _id: '$route',
                    total: { $sum: '$visits' }
                }
            },
            { $sort: { total: -1 } },
            { $limit: 1 }
        ]);


        // Monthly top user
        const topUserAgg = await DailyUsers.aggregate([
            { $match: { user: { $ne: null }, createdAt: { $gte: currentStart, $lte: currentEnd } } },
            {
                $group: {
                    _id: '$user',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    name: '$userInfo.name',
                    username: '$userInfo.username',
                    count: 1
                }
            }
        ]);

        // Peak hour analysis (when most DailyUsers first arrived)
        const hourly = await DailyUsers.aggregate([
            {
                $match: {
                    createdAt: { $gte: currentStart, $lte: currentEnd }
                }
            },
            {
                $project: {
                    hour: {
                        $hour: {
                            date: { $add: ['$createdAt', 19800000] },
                            timezone: 'Asia/Kolkata'
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$hour',
                    total: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } },
            { $limit: 1 }
        ]);

        // New users this month
        const newUsers = await Users.countDocuments({
            joinedAt: { $gte: currentStart, $lte: currentEnd }
        });
        const peakHour = hourly.length
            ? `${(hourly[0]._id % 12 || 12)} ${hourly[0]._id < 12 ? 'AM' : 'PM'}`
            : null;

        return {
            current,
            previous,
            change: {
                total: calcChange(current.total, previous.total),
                guests: calcChange(current.guests, previous.guests),
                known: calcChange(current.known, previous.known)
            },
            visits: {
                current: totalVisits,
                previous: totalPrevVisits,
                change: visitChange
            },
            topUser: topUserAgg[0] || null,
            topRoute: topRoute[0]?._id || null,
            peakHour,
            newUsers
        };
    } catch (err) {
        console.error(err);
        return null
    }
}

cron.schedule('50 23 * * 6', async () => {
    try {
        const data = await getMonthlyAnalyticsData();
        if(data){
        const admins = await Users.find({role: 'admin', username: {$ne: '2k17platform'}}).select("email");
        const adminEmails = admins.map(u => u.email)
        await sendMail('weekly_report', adminEmails, data);
        console.log('✅ Weekly analytics report sent to', adminEmails);
        }
    } catch (err) {
        console.error('❌ Failed to send weekly report', err);
    }
}, {
    timezone: 'Asia/Kolkata'
});