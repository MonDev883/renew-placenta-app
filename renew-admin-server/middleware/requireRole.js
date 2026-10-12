const Admin = require('../models/Admin');

module.exports = function requireRole(...allowed) {
  return async (req, res, next) => {
    const admin = await Admin.findById(req.admin.id).select('username email role');
    if (!admin) {
      return res.status(401).json({ error: 'This account no longer exists. Please log in again.' });
    }
    if (allowed.length && !allowed.includes(admin.role)) {
      return res.status(403).json({ error: 'You do not have permission to do this.' });
    }
    req.adminUser = admin;
    next();
  };
};