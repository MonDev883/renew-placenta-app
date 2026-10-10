const express = require('express');
const Message = require('../models/Message');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Public: anyone can submit the contact form
router.post('/messages', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const saved = await Message.create({ name, email, message });
  res.status(201).json(saved);
});

// Admin only: view all messages
router.get('/admin/messages', requireAuth, async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

// Admin only: mark a message as read
router.put('/admin/messages/:id/read', requireAuth, async (req, res) => {
  const message = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!message) return res.status(404).json({ error: 'Message not found' });
  res.json(message);
});

// Admin only: delete a message
router.delete('/admin/messages/:id', requireAuth, async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ error: 'Message not found' });
  res.json({ success: true });
});

module.exports = router;