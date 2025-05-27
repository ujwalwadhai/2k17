var Posts = require("../../models/Posts");

const fetchPosts = async (req, res) => {
  try {
    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    var posts = await Posts.find({ createdAt: { $gte: sixMonthsAgo } }).populate("likes", "username profile").sort({ createdAt: -1 });
    return res.json({ success: true, posts });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = fetchPosts;