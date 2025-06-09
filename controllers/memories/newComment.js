var Files = require('../../models/Files');

const newComment = async (req, res) => {
    try {
        var file = await Files.findById(req.params.fileId)
        if (file.comments) {
            var newCommentData = await file.comments.create({
                user: req.user._id,
                text: req.body.text
            });
            file.comments.push(newCommentData);
        } else {
            file.comments = []
            var newCommentData = await file.comments.create({
                user: req.user._id,
                text: req.body.text
            });
            file.comments.push(newCommentData);
        }
        await file.save();
        res.json({ success: true, commentsLength: file.comments.length, message: 'Comment added' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to add comment' });
    }
}

module.exports = newComment;