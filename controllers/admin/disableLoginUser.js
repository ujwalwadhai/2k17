const Users = require('../../models/Users');
const mongoose = require('mongoose');

async function disableLoginUser(req, res) {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.registered = !user.registered;
    await user.save();

    return res.status(200).json({
        success: true,
        message: user.registered ? 'User enabled successfully' : 'User disabled and logged out successfully',
        name: user.name,
        registered: user.registered
    });
}

module.exports = disableLoginUser;
