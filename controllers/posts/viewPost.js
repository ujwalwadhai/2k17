var Posts = require('../../models/Posts');

const viewPost = async (req, res) => {
  var post = await Posts.findOne({ _id: req.params.id }).populate('comments.user likes', 'name username profile')
  if(!post) return res.redirect('/');
  var comments = post.comments;
  res.render('pages/post', {post, comments});
}

module.exports = viewPost;