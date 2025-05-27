var { subDays, startOfDay, endOfDay } = require('../../utils/time');
var Logs = require('../../models/Logs');

const fetchLogs = async (req, res) => {
  var dayOffset = parseInt(req.query.dayOffset) || 0;
  var targetDate = subDays(new Date(), dayOffset);

  var start = startOfDay(targetDate);
  var end = endOfDay(targetDate);

  try {
    var logs = await Logs.find({
      createdAt: { $gte: start, $lte: end }
    })
    .populate('user', 'username')
    .sort({ createdAt: -1 });

    res.json({success:true, logs, date: targetDate });
  } catch (err) {
    console.log(err);
    res.status(500).json({success:false, error: 'Failed to load logs' });
  }
};

module.exports = fetchLogs;