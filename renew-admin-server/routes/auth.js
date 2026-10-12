const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { logActivity } = require('../utils/activity');
const { sendOtpEmail, sendResetEmail } = require('../utils/mailer');

const router = express.Router();
const ROLES = ['owner', 'editor', 'support'];

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Please try again later.' },
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Please try again later.' },
});

const hashCode = (code) => crypto.createHash('sha256').update(String(code)).digest('hex');

// Step 1: verify username + password, then email a code
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const matches = await bcrypt.compare(password, admin.passwordHash);
  if (!matches) {
    await logActivity(req, { actor: admin, action: 'login.failed', details: 'Wrong password' });
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  if (!admin.email) {
    return res.status(400).json({ error: 'This account has no email on file. Contact the site owner.' });
  }

  const code = crypto.randomInt(100000, 1000000).toString();
  admin.otpCode = code;
  admin.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await admin.save();

  try {
    await sendOtpEmail(admin.email, code);
  } catch (err) {
    console.error('OTP email failed:', err.message);
    return res.status(500).json({ error: 'Could not send verification email' });
  }

  const maskedEmail = admin.email.replace(/^(.{2}).+(@.+)$/, '$1***$2');
  res.json({ otpRequired: true, username: admin.username, maskedEmail });
});

// Step 2: verify the emailed code, issue the real token
router.post('/verify-otp', loginLimiter, async (req, res) => {
  const { username, code } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin || !admin.otpCode || !admin.otpExpires) {
    return res.status(401).json({ error: 'No pending verification for this account' });
  }

  if (admin.otpExpires < new Date()) {
    return res.status(401).json({ error: 'Code expired. Please log in again.' });
  }

  if (admin.otpCode !== code) {
    return res.status(401).json({ error: 'Incorrect code' });
  }

  admin.otpCode = undefined;
  admin.otpExpires = undefined;
  await admin.save();

  const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });

  await logActivity(req, { actor: admin, action: 'login', details: 'Logged in' });
  res.json({ token, username: admin.username, role: admin.role });
});

// Any logged-in admin: who am I (used by the frontend to show or hide features)
router.get('/me', requireAuth, requireRole(), async (req, res) => {
  const { username, email, role } = req.adminUser;
  res.json({ username, email, role });
});

// Any logged-in admin: change own password
router.put('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  const admin = await Admin.findById(req.admin.id);
  if (!admin) return res.status(404).json({ error: 'Account not found' });

  const matches = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!matches) return res.status(401).json({ error: 'Current password is incorrect' });

  admin.passwordHash = await bcrypt.hash(newPassword, 10);
  await admin.save();

  await logActivity(req, { actor: admin, action: 'password.change', target: admin.username });
  res.json({ success: true });
});

// Owner only: create a new admin account
router.post('/admins', requireAuth, requireRole('owner'), async (req, res) => {
  const { username, password, email, role = 'support' } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password, and email are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const existing = await Admin.findOne({ username });
  if (existing) {
    return res.status(400).json({ error: 'That username is already taken' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ username, passwordHash, email, role });

  await logActivity(req, { action: 'admin.create', target: admin.username, details: `role: ${role}` });
  res.status(201).json({ username: admin.username, email: admin.email, role: admin.role });
});

// Owner only: list all admin accounts (no passwords returned)
router.get('/admins', requireAuth, requireRole('owner'), async (req, res) => {
  const admins = await Admin.find().select('username email role');
  res.json(admins);
});

// Owner only: change another admin's role
router.put('/admins/:id/role', requireAuth, requireRole('owner'), async (req, res) => {
  const { role } = req.body;
  if (!ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (req.params.id === String(req.admin.id)) {
    return res.status(400).json({ error: 'You cannot change your own role' });
  }

  const target = await Admin.findById(req.params.id);
  if (!target) return res.status(404).json({ error: 'Account not found' });

  const previous = target.role;
  target.role = role;
  await target.save();

  await logActivity(req, { action: 'admin.role', target: target.username, details: `${previous} -> ${role}` });
  res.json({ success: true });
});

// Owner only: delete an admin account (cannot delete yourself or the last owner)
router.delete('/admins/:id', requireAuth, requireRole('owner'), async (req, res) => {
  if (req.params.id === String(req.admin.id)) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  const target = await Admin.findById(req.params.id);
  if (!target) return res.status(404).json({ error: 'Account not found' });

  if (target.role === 'owner') {
    const owners = await Admin.countDocuments({ role: 'owner' });
    if (owners <= 1) {
      return res.status(400).json({ error: 'You cannot delete the last owner account' });
    }
  }

  await target.deleteOne();
  await logActivity(req, { action: 'admin.delete', target: target.username, details: target.email });
  res.json({ success: true });
});

// Owner only: activity log (newest first)
router.get('/activity', requireAuth, requireRole('owner'), async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 300);
  const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(limit);
  res.json(logs);
});

// Forgot password, step 1: request a reset code
router.post('/forgot-password', resetLimiter, async (req, res) => {
  const { username } = req.body;
  const reply = { message: 'If that account exists, a reset code has been sent to its email.' };

  if (!username) return res.status(400).json({ error: 'Username is required' });

  const admin = await Admin.findOne({ username });
  if (!admin || !admin.email) return res.json(reply);

  const code = crypto.randomInt(100000, 1000000).toString();
  admin.resetCodeHash = hashCode(code);
  admin.resetExpires = new Date(Date.now() + 10 * 60 * 1000);
  admin.resetAttempts = 0;
  await admin.save();

  try {
    await sendResetEmail(admin.email, code);
  } catch (err) {
    console.error('Reset email failed:', err.message);
  }

  res.json(reply);
});

// Forgot password, step 2: verify the code and set a new password
router.post('/reset-password', resetLimiter, async (req, res) => {
  const { username, code, newPassword } = req.body;
  const invalid = () => res.status(400).json({ error: 'Invalid or expired code' });

  if (!username || !code || !newPassword) {
    return res.status(400).json({ error: 'Username, code, and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const admin = await Admin.findOne({ username });
  if (!admin || !admin.resetCodeHash || !admin.resetExpires) return invalid();

  if (admin.resetExpires < new Date() || admin.resetAttempts >= 5) {
    admin.resetCodeHash = undefined;
    admin.resetExpires = undefined;
    await admin.save();
    return invalid();
  }

  if (hashCode(code) !== admin.resetCodeHash) {
    admin.resetAttempts += 1;
    await admin.save();
    return invalid();
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 10);
  admin.resetCodeHash = undefined;
  admin.resetExpires = undefined;
  admin.resetAttempts = 0;
  admin.otpCode = undefined;
  admin.otpExpires = undefined;
  await admin.save();

  await logActivity(req, { actor: admin, action: 'password.reset', target: admin.username });
  res.json({ success: true });
});

module.exports = router;