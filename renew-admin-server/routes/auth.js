const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const requireAuth = require('../middleware/requireAuth');
const { sendOtpEmail } = require('../utils/mailer');

const router = express.Router();

// Step 1: verify username + password, then email a code
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const matches = await bcrypt.compare(password, admin.passwordHash);
  if (!matches) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  if (!admin.email) {
    return res.status(400).json({ error: 'This account has no email on file. Contact the site owner.' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  admin.otpCode = code;
  admin.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await admin.save();

  try {
    await sendOtpEmail(admin.email, code);
  } catch (err) {
    return res.status(500).json({ error: 'Could not send verification email' });
  }

  const maskedEmail = admin.email.replace(/^(.{2}).+(@.+)$/, '$1***$2');
  res.json({ otpRequired: true, username: admin.username, maskedEmail });
});

// Step 2: verify the emailed code, issue the real token
router.post('/verify-otp', async (req, res) => {
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

  res.json({ token, username: admin.username });
});

// Admin only: change own password
router.put('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }

  const admin = await Admin.findById(req.admin.id);
  if (!admin) return res.status(404).json({ error: 'Account not found' });

  const matches = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!matches) return res.status(401).json({ error: 'Current password is incorrect' });

  admin.passwordHash = await bcrypt.hash(newPassword, 10);
  await admin.save();
  res.json({ success: true });
});

// Admin only: create a new co-admin account
router.post('/admins', requireAuth, async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password, and email are required' });
  }

  const existing = await Admin.findOne({ username });
  if (existing) {
    return res.status(400).json({ error: 'That username is already taken' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await Admin.create({ username, passwordHash, email });
  res.status(201).json({ username: admin.username, email: admin.email });
});

// Admin only: list all admin accounts (no passwords returned)
router.get('/admins', requireAuth, async (req, res) => {
  const admins = await Admin.find().select('username email');
  res.json(admins);
});

// Admin only: delete an admin account
router.delete('/admins/:id', requireAuth, async (req, res) => {
  await Admin.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;