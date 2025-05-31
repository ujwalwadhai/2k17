const Users = require('../../models/Users');

const subscribePush = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ message: 'Invalid subscription object.' });
  }

  try {
    const user = await Users.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the subscription already exists for the user
    const existingSubscription = user.pushSubscriptions?.find(
      sub => sub.endpoint === subscription.endpoint
    );

    if (existingSubscription) {
      return res.status(200).json({ message: 'Subscription already exists.' });
    }
    user.pushSubscriptions = user.pushSubscriptions || [];
    user.pushSubscriptions.push(subscription);
    await user.save();
    res.status(201).json({ message: 'Subscription saved successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save subscription.' });
  }
};

module.exports = subscribePush;