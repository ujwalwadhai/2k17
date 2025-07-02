const Users = require('../../models/Users');

async function disableLoginUser(req, res) {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({success: false, message: 'User ID is required' });
    }

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.registered = !user.registered;

    await user.save()

    res.status(201).json({success: true, message: 'User disabled successfully', userData: { email: user.email }, registered: user.registered });
}

module.exports = disableLoginUser;