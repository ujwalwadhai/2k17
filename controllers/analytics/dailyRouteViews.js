const PageViews = require('../../models/PageViews');
const Users = require('../../models/Users');

const dailyRouteViews = async (req, res) => {
    const inputDate = req.query.date || new Date().toISOString().slice(0, 10); // expected yyyy-mm-dd
    const [year, month, day] = inputDate.split('-');
    const date = `${day}/${month}/${year}`;
    const usernames = await Users.find({}, 'username').lean();
    const excludedRoutes = usernames.map(u => '/' + u.username);
    const result = await PageViews.aggregate([
        {
            $match: {
                date,
                route: {
                    $nin: excludedRoutes,
                    $not: { $regex: '^/(memories|post)/' }
                }
            }
        },
        {
            $group: {
                _id: "$route",
                total: { $sum: "$visits" }
            }
        },
        { $sort: { total: -1, _id: 1 } },
        { $limit: 10 },
        {
            $project: {
                route: "$_id",
                total: 1,
                _id: 0
            }
        }
    ]);

    res.json(result);
};

module.exports = dailyRouteViews;
