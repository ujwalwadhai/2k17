const DailyUsers = require('../../models/DailyUsers');

const dailyUsers = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' });
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

    res.json(result || { total: 0, guests: 0, known: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unique users' });
  }
};

module.exports = dailyUsers;