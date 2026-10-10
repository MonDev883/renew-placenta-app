const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const requireAuth = require('../middleware/requireAuth');
upload = require('../middleware/upload');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});


// Public: anyone (your website) can read the product list
router.get('/products', async (req, res) => {
  const products = await Product.find().sort({ order: 1 });
  res.json(products);
});

// Admin only: create
router.post('/admin/products', requireAuth, async (req, res) => {
  const count = await Product.countDocuments();
  const product = await Product.create({ ...req.body, order: count });
  res.status(201).json(product);
});

// Admin only: move a product up or down in the list
router.put('/admin/products/:id/move', requireAuth, async (req, res) => {
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

  res.json({ success: true });
});

// Admin only: upload an image, get back its URL
router.post('/admin/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

 // const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
 // <--- 2. req.file.path holds the permanent Cloudinary secure URL!
  res.json({ url: req.file.path });
});

// Admin only: update
router.put('/admin/products/:id', requireAuth, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Admin only: delete
router.delete('/admin/products/:id', requireAuth, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true });
});

module.exports = router;