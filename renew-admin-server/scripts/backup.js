const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const mongoose = require('mongoose');

const Product = require('../models/Product');
const Message = require('../models/Message');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');
const SiteContent = require('../models/SiteContent');

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing from .env');
  await mongoose.connect(process.env.MONGODB_URI);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dir = path.join(__dirname, '..', 'backups');
  fs.mkdirSync(dir, { recursive: true });

  const data = {
    createdAt: new Date().toISOString(),
    // Product documents include the Cloudinary image links (imageUrl and images)
    products: await Product.find().sort({ order: 1 }).lean(),
    messages: await Message.find().sort({ createdAt: -1 }).lean(),
    // Admins are saved WITHOUT password hashes or codes
    admins: await Admin.find().select('username email role').lean(),
    activity: await ActivityLog.find().sort({ createdAt: -1 }).limit(1000).lean(),
    siteContent: await SiteContent.find().lean(),
  };

  const file = path.join(dir, `backup-${stamp}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

    // Keep only the 12 most recent backups in this folder
  fs.readdirSync(dir)
    .filter((f) => /^backup-.*\.json$/.test(f))
    .sort()
    .reverse()
    .slice(12)
    .forEach((f) => fs.unlinkSync(path.join(dir, f)));

  console.log(`Backup saved: ${file}`);
  console.log(`Products: ${data.products.length}, Messages: ${data.messages.length}, Admins: ${data.admins.length}, Activity entries: ${data.activity.length}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Backup failed:', err.message);
  process.exit(1);
});