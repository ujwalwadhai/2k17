const DailyUsers = require('../../models/DailyUsers');
const Users = require('../../models/Users');
const UserSessions = require('../../models/UserSessions');

async function getSessionMetricsForDate(targetDate) {
    const timeZone = 'Asia/Kolkata';
    const istOffset = '+05:30';

    const year = targetDate.toLocaleString('en-US', { timeZone, year: 'numeric' });
    const month = targetDate.toLocaleString('en-US', { timeZone, month: '2-digit' });
    const day = targetDate.toLocaleString('en-US', { timeZone, day: '2-digit' });

    const startOfDayStringIST = `${year}-${month}-${day}T00:00:00.000${istOffset}`;
    const endOfDayStringIST = `${year}-${month}-${day}T23:59:59.999${istOffset}`;

    const startUTC = new Date(startOfDayStringIST);
    const endUTC = new Date(endOfDayStringIST);

    const result = await UserSessions.aggregate([
        {
            $match: {
                startTime: {
                    $gte: startUTC,
                    $lte: endUTC
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

    if (result.length > 0) {
        return result[0];
    } else {
        return { collectiveTime: 0, avgTime: 0, count: 0 };
    }
}

async function getAnalyticsWithChange() {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const [todayMetrics, yesterdayMetrics] = await Promise.all([
        getSessionMetricsForDate(today),
        getSessionMetricsForDate(yesterday)
    ]);

    const changeInCollectiveTime = todayMetrics.collectiveTime - yesterdayMetrics.collectiveTime;
    const changeInAvgTime = todayMetrics.avgTime - yesterdayMetrics.avgTime;

    return {
        today: {
            collectiveTime: (todayMetrics.collectiveTime / 60).toFixed(2),
            avgTime: (todayMetrics.avgTime / 60).toFixed(2),
            sessionCount: todayMetrics.count
        },
        change: {
            collectiveTime: (changeInCollectiveTime / 60).toFixed(2),
            avgTime: (changeInAvgTime / 60).toFixed(2)
        }
    };
}

const dailyUsers = async (req, res) => {
  try {
    const dateParts = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).formatToParts(new Date());

    const day = dateParts.find(p => p.type === 'day').value;
    const month = dateParts.find(p => p.type === 'month').value;
    const year = dateParts.find(p => p.type === 'year').value;

    const today = `${day}/${month}/${year}`;
    const [result] = await DailyUsers.aggregate([
      { $match: { date: today } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          guests: { $sum: { $cond: [{ $eq: ['$user', null] }, 1, 0] } },
          known: { $sum: { $cond: [{ $ne: ['$user', null] }, 1, 0] } }
        }
      }
    ]);
    const sessionTimeData = await getAnalyticsWithChange();

    res.json({sessionTimeData, result: result || { total: 0, guests: 0, known: 0 }});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unique users' });
  }
};

module.exports = dailyUsers;