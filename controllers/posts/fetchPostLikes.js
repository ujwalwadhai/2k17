const Posts = require('../../models/Posts');
const fetchPostLikes = async (req, res) => {
    try {
        const post = await Posts.findById(req.params.postId).populate("likes");
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const likes = post.likes;
        res.status(200).json({success:true, likes});
    } catch (error) {
        console.error(error);
        res.status(500).json({success:false, message: 'Server error' });
    }
}

module.exports = fetchPostLikes;