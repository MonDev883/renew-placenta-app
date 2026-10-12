const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  username: String,
  role: String,
  action: { type: String, required: true },
  target: String,
  details: String,
  ip: String,
  // Entries are deleted automatically after 1 year. Remove "expires" to keep them forever.
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 365 },
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);