var Posts = require('../../models/Posts');
var logActivity = require('../../utils/log');

const newPost = async (req, res) => {
  try {
    if (req.file) {
      var newPost = new Posts({
        author: req.user._id,
        text: req.body.text,
        media: {
          url: req.file.path,
          type: req.file.mimetype
        },
        likes: [req.user._id],
        comments: []
      });
      await newPost.save();
    } else {
      var newPost = new Posts({
        author: req.user._id,
        text: req.body.text,
        likes: [req.user._id],
        comments: []
      });
      await newPost.save();
    }
    logActivity(req.user._id, 'New Post', `Created new post (${newPost._id})`);
    return res.json({ success: true, message: 'Post created' });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: 'Something went wrong' });
  }
}

module.exports = newPost;