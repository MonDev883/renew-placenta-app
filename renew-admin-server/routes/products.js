const express = require('express');
const Product = require('../models/Product');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { logActivity } = require('../utils/activity');
const upload = require('../middleware/upload');

const router = express.Router();

// Product name for the activity log (works whether the field is "name" or "title")
const label = (p) => p.name || p.title || String(p._id);

// Public: anyone (your website) can read the product list
router.get('/products', async (req, res) => {
  const products = await Product.find().sort({ order: 1 });
  res.json(products);
});

// Owner or editor: create
router.post('/admin/products', requireAuth, requireRole('owner', 'editor'), async (req, res) => {
  const count = await Product.countDocuments();
  const product = await Product.create({ ...req.body, order: count });

  await logActivity(req, { action: 'product.create', target: label(product) });
  res.status(201).json(product);
});

// Owner or editor: move a product up or down in the list
router.put('/admin/products/:id/move', requireAuth, requireRole('owner', 'editor'), async (req, res) => {
  const { direction } = req.body;
  const products = await Product.find().sort({ order: 1 });
  const index = products.findIndex(p => p._id.toString() === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= products.length) {
    return res.json({ success: true });
  }

  const current = products[index];
  const target = products[targetIndex];
  const tempOrder = current.order;
  current.order = target.order;
  target.order = tempOrder;
  await current.save();
  await target.save();

  await logActivity(req, { action: 'product.reorder', target: label(current), details: `moved ${direction}` });
  res.json({ success: true });
});

// Owner or editor: upload an image, get back its permanent Cloudinary URL
router.post('/admin/upload', requireAuth, requireRole('owner', 'editor'), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: req.file.path });
});

// Owner or editor: update
router.put('/admin/products/:id', requireAuth, requireRole('owner', 'editor'), async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  await logActivity(req, {
    action: 'product.update',
    target: label(product),
    details: `fields: ${Object.keys(req.body).join(', ')}`,
  });
  res.json(product);
});

// Owner or editor: delete
router.delete('/admin/products/:id', requireAuth, requireRole('owner', 'editor'), async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  await logActivity(req, { action: 'product.delete', target: label(product) });
  res.json({ success: true });
});

module.exports = router;