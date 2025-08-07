const DailyUsers = require('../../models/DailyUsers');
const PageViews = require('../../models/PageViews');
const Files = require('../../models/Files');
const Folders = require('../../models/Folders');
const UserSessions = require('../../models/UserSessions');

const getMonthRange = (offset = 0) => {
    const timeZone = 'Asia/Kolkata';
    const istOffset = '+05:30';

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + offset);

    const year = parseInt(targetDate.toLocaleString('en-US', { timeZone, year: 'numeric' }));
    const month = parseInt(targetDate.toLocaleString('en-US', { timeZone, month: '2-digit' }));

    const start = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000${istOffset}`);

    const nextMonth = (month === 12) ? 1 : month + 1;
    const nextMonthYear = (month === 12) ? year + 1 : year;
    const startOfNextMonth = new Date(`${nextMonthYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00.000${istOffset}`);
    const end = new Date(startOfNextMonth.getTime() - 1);

    return { start, end };
};

async function getAverageTimeForRange(startDate, endDate) {
    const result = await UserSessions.aggregate([
        {
            $match: {
                startTime: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                avgDuration: { $avg: '$duration' }
            }
        }
    ]);

    return result.length > 0 ? result[0].avgDuration : 0;
}

async function getMonthlyAvgTimeWithChange() {
    const thisMonthRange = getMonthRange(0);    
    const lastMonthRange = getMonthRange(-1);    

    const [thisMonthAvg, lastMonthAvg] = await Promise.all([
        getAverageTimeForRange(thisMonthRange.start, thisMonthRange.end),
        getAverageTimeForRange(lastMonthRange.start, lastMonthRange.end)
    ]);

    const changeInAvgTime = thisMonthAvg - lastMonthAvg;

    return {
        thisMonth: {
            avgTime: (thisMonthAvg / 60).toFixed(2)
        },
        change: {
            avgTime: (changeInAvgTime / 60).toFixed(2)
        }
    };
}

const monthlyUsers = async (req, res) => {
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
                    date: { $regex: `${currentMonthStr.replace('/', '\\/')}$` },
                    route: { $not: /\/memories\// }
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

        // Monthly top file/folder from Memories
        const monthlyTopFile = await PageViews.aggregate([
            {
                $match: {
                    date: { $regex: `${currentMonthStr.replace('/', '\\/')}$` },
                    route: { $regex: /^\/memories\/file\// }
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
        let topFile = {}
        const topFileName = await Files.findOne({ _id: monthlyTopFile[0]?._id.split('/').pop() }).select('name');
        if (topFileName) {
            topFile = {
                _id: monthlyTopFile[0]?._id,
                name: topFileName.name.split('.')[0]
            };
        }

        const monthlyTopFolder = await PageViews.aggregate([
            {
                $match: {
                    date: { $regex: `${currentMonthStr.replace('/', '\\/')}$` },
                    route: { $regex: /^\/memories\/folder\// }
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
        let topFolder = {}
        const topFolderName = await Folders.findOne({ _id: monthlyTopFolder[0]?._id.split('/').pop() }).select('name');
        if (topFolderName) {
            topFolder = {
                _id: monthlyTopFolder[0]?._id,
                name: topFolderName.name
            };
        }

        const sessionData = await getMonthlyAvgTimeWithChange()

        res.json({
            current,
            previous,
            sessionData,
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
            topFolder,
            topFile,
            platform_breakdown
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch monthly user stats' });
    }
};

module.exports = monthlyUsers;
