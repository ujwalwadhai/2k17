const PageViews = require('../../models/PageViews');

var pageStats = async (req, res) => {
  const stats = await PageViews.aggregate([
    {
      $group: {
        _id: "$route",
        total_views: { $sum: "$visits" }
      }
    },
    { $sort: { total_views: -1, _id: 1 } }
  ]);

  res.json(stats);
}

module.exports = pageStats;