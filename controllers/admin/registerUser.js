const Users = require('../../models/Users');

async function registerUser(req, res) {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({success: false, message: 'User ID is required' });
    }

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.registered = true;
    user.registeredAt = new Date();

    await user.save()

    res.status(201).json({success: true, message: 'User registered successfully', userData: { email: user.email } });
}

module.exports = registerUser;