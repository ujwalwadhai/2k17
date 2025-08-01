const Posts = require('../../models/Posts');
var Notifications = require('../../models/Notifications');
var sendPushNotification = require('../../utils/push');

const toggleReaction = async (req, res) => {
    try {
        const { postId } = req.params;
        const { reaction } = req.body;
        const userId = req.user.id;

        const allowedReactions = ['😂', '🔥', '🎉'];
        if (!allowedReactions.includes(reaction)) {
            return res.status(400).json({ msg: 'Invalid reaction.' });
        }

        const post = await Posts.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found.' });
        }

        const existingReaction = post.reactions.find(r => r.user.toString() === userId);

        if (existingReaction) {
            if (existingReaction.reaction === reaction) {
                post.reactions.pull({ _id: existingReaction._id });
            } else {
                existingReaction.reaction = reaction;
            }
        } else {
            post.reactions.push({ user: userId, reaction });
            var notification = new Notifications({
                user: post.author,
                type: 'postreact',
                fromUser: userId,
                message: `reacted ${reaction} to your post.`,
                url: `/post/${post._id}`
            })
            await notification.save();
            await sendPushNotification({
                userId: post.author,
                type: 'postreact',
                data: {
                    user: req.user,
                    reaction,
                    postId: post._id
                }
            });
        }

        await post.save();
        res.json(post.reactions);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = toggleReaction;