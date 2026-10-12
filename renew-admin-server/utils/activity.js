const ActivityLog = require('../models/ActivityLog');

// Never lets a logging problem break the real request.
async function logActivity(req, { action, target = '', details = '', actor }) {
  try {
    const a = actor || req.adminUser || {};
    await ActivityLog.create({
      admin: a._id,
      username: a.username || req.admin?.username,
      role: a.role,
      action,
      target: String(target).slice(0, 200),
      details: String(details).slice(0, 500),
      ip: req.ip,
    });
  } catch (err) {
    console.error('Activity log failed:', err.message);
  }
}

module.exports = { logActivity };