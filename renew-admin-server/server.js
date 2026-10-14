const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const messageRoutes = require('./routes/messages');
const requireAuth = require('./middleware/requireAuth');
const Admin = require('./models/Admin');

const app = express();
app.set('trust proxy', 1);

// Only these websites may call the API from a browser.
// Extra origins can be added in Render with ALLOWED_ORIGINS (comma-separated).
const allowedOrigins = [
  'https://renew-placenta.netlify.app',
  'https://renew-placenta-app.vercel.app',
  'http://localhost:5173',
  ...(process.env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean),
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
}));

app.use(express.json({ limit: '100kb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api', messageRoutes);
app.get('/api/admin/ping', requireAuth, (req, res) => {
  res.json({ message: `Hello, ${req.admin.username}. You are logged in.` });
});

// HEALTH CHECK ENDPOINT
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Central error handler (must stay after all routes)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const result = await Admin.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'owner' } }
    );
    if (result.modifiedCount) {
      console.log(`Set ${result.modifiedCount} existing admin(s) to owner`);
    }
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));