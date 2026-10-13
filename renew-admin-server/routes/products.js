const express = require('express');
const Product = require('../models/Product');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const { logActivity } = require('../utils/activity');
const upload = require('../middleware/upload');

const router = express.Router();

// Product name for the activity log (works whether the field is "name" or "title")
const label = (p) => p.name || p.title || String(p._id);

// Only these fields can be set through the admin create/update routes
const EDITABLE = [
  'name', 'cat', 'price', 'size', 'blurb', 'best', 'hidden', 'outOfStock',
  'scope', 'imageUrl', 'images', 'slideImageUrl', 'noSlide', 'shopeeUrl', 'lazadaUrl',
];
const pick = (body = {}) =>
  Object.fromEntries(Object.entries(body).filter(([key]) => EDITABLE.includes(key)));

// Public: anyone (your website) can read the product list. Hidden products are left out.
router.get('/products', async (req, res) => {
  const products = await Product.find({ hidden: { $ne: true } }).sort({ order: 1 });
  res.json(products);
});

// Owner or editor: list ALL products, including hidden ones
router.get('/admin/products', requireAuth, requireRole('owner', 'editor'), async (req, res) => {
  const products = await Product.find().sort({ order: 1 });
  res.json(products);
});

// Owner or editor: create
router.post('/admin/products', requireAuth, requireRole('owner', 'editor'), async (req, res) => {
  // New products go to the end of the list (highest order + 1, so deletions never cause duplicates)
  const last = await Product.findOne().sort({ order: -1 });
  const order = last ? last.order + 1 : 0;

  const product = await Product.create({ ...pick(req.body), order });

  await logActivity(req, { action: 'product.create', target: label(product) });
  res.status(201).json(product);
});

// Owner or editor: move a product up or down in the list
router.put('/admin/products/:id/move', requireAuth, requireRole('owner', 'editor'), async (req, res) => {
  const { direction } = req.body;
  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ error: 'Direction must be "up" or "down"' });
  }

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

// Owner or editor: quickly hide/show or mark in/out of stock
router.put('/admin/products/:id/flags', requireAuth, requireRole('owner', 'editor'), async (req, res) => {
  const updates = {};
  if (typeof req.body.hidden === 'boolean') updates.hidden = req.body.hidden;
  if (typeof req.body.outOfStock === 'boolean') updates.outOfStock = req.body.outOfStock;
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  await logActivity(req, {
    action: 'product.update',
    target: label(product),
    details: Object.entries(updates).map(([k, v]) => `${k}: ${v}`).join(', '),
  });
  res.json(product);
});

// Owner or editor: update
router.put('/admin/products/:id', requireAuth, requireRole('owner', 'editor'), async (req, res) => {
  const changes = pick(req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, changes, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });

  await logActivity(req, {
    action: 'product.update',
    target: label(product),
    details: `fields: ${Object.keys(changes).join(', ')}`,
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