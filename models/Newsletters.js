var mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    scheduledAt: { type: String, required: true },
    published: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Newsletters', newsletterSchema);
