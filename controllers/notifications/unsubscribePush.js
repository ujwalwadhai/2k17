
const unsubscribePush = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }
    const { endpoint } = req.body; // Client should send the endpoint of the subscription to remove
    if (!endpoint) {
        return res.status(400).json({ message: 'Subscription endpoint is required.' });
    }
    try {
        const user = await Users.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const initialCount = user.pushSubscriptions.length;
        user.pushSubscriptions = user.pushSubscriptions.filter(sub => sub.endpoint !== endpoint);

        if (user.pushSubscriptions.length < initialCount) {
            await user.save();
            console.log('Push subscription removed for user:', req.user._id, 'endpoint:', endpoint);
            res.status(200).json({ message: 'Subscription removed successfully.' });
        } else {
            console.log('Push subscription not found for removal for user:', req.user._id, 'endpoint:', endpoint);
            res.status(404).json({ message: 'Subscription not found.' });
        }
    } catch (error) {
        console.error('Error removing push subscription:', error);
        res.status(500).json({ message: 'Failed to remove subscription.' });
    }
};

module.exports = unsubscribePush;