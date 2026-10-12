const express = require('express');
const rateLimit = require('express-rate-limit');
const Message = require('../models/Message');
const requireAuth = require('../middleware/requireAuth');
const { sendNewMessageAlert } = require('../utils/mailer');
const requireRole = require('../middleware/requireRole');
const { logActivity } = require('../utils/activity');

const router = express.Router();

// Limits how many messages one visitor can send (protects your inbox and Brevo quota)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages sent. Please try again later.' },
});

// Public: anyone can submit the contact form
router.post('/messages', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (String(name).length > 100 || String(email).length > 150 || String(message).length > 2000) {
    return res.status(400).json({ error: 'Message is too long' });
  }

  const saved = await Message.create({ name, email, message });

  // Email alert: not awaited, so a failed email never blocks the customer
  sendNewMessageAlert(saved).catch((err) =>
    console.error('Message alert failed:', err.message)
  );

  res.status(201).json(saved);
});

// Any admin role: view all messages
router.get('/admin/messages', requireAuth, requireRole(), async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

// Any admin role: mark a message as read
router.put('/admin/messages/:id/read', requireAuth, requireRole(), async (req, res) => {
  const message = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!message) return res.status(404).json({ error: 'Message not found' });
  await logActivity(req, { action: 'message.read', target: message.name, details: message.email });
  res.json(message);
});

// Owner or editor: delete a message
router.delete('/admin/messages/:id', requireAuth, requireRole('owner', 'editor'), async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ error: 'Message not found' });
  await logActivity(req, { action: 'message.delete', target: message.name, details: message.email });
  res.json({ success: true });
});

module.exports = router;