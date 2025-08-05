const DailyUsers = require('../../models/DailyUsers');

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

    res.json(result || { total: 0, guests: 0, known: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unique users' });
  }
};

module.exports = dailyUsers;