const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
  route: { type: String, required: true },
  visits: { type: Number, default: 1 },
  date: { type: String, default: new Date().toLocaleDateString('en-IN', {day: '2-digit', month: '2-digit', year:'numeric', timeZone: 'Asia/Kolkata' }) }
});

pageViewSchema.index({ route:1, date: 1 }, { unique:true, expireAfterSeconds: 60 * 24 * 60 * 60 });

module.exports = mongoose.model('PageViews', pageViewSchema);