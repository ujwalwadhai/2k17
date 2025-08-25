const Users = require('../../models/Users');
const Sessions = require('../../models/Sessions');
const mongoose = require('mongoose');

async function disableLoginUser(req, res) {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.verified = !user.verified;
    await user.save();
    if(!user.verified){
        await Sessions.deleteMany({ session: {$regex : userId} });
    }

    return res.status(200).json({
        success: true,
        message: user.verified ? 'Login enabled successfully' : 'Login disabled and logged out successfully',
        name: user.name,
        verified: user.verified
    });
}

module.exports = disableLoginUser;
