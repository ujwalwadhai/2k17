const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  badgeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  howTo: { type: String, required: true }
});

module.exports = mongoose.model('Badges', badgeSchema);