const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const mongoose = require('mongoose');

const Product = require('../models/Product');
const Message = require('../models/Message');

const file = process.argv[2];
if (!file || !process.argv.includes('--confirm')) {
  console.log('Usage: node scripts/restore.js backups/backup-YYYY-MM-DDTHH-MM-SS.json --confirm');
  process.exit(1);
}

async function restore(Model, docs, name) {
  if (!docs || docs.length === 0) {
    console.log(`${name}: nothing to restore`);
    return;
  }
  const ops = docs.map(({ _id, ...rest }) => ({
    updateOne: {
      filter: { _id },
      update: { $setOnInsert: rest }, // only used when the document is missing
      upsert: true,
    },
  }));
  const result = await Model.bulkWrite(ops, { timestamps: false });
  const restored = result.upsertedCount || 0;
  console.log(`${name}: ${restored} restored, ${docs.length - restored} already existed`);
}

async function main() {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  await mongoose.connect(process.env.MONGODB_URI);
  await restore(Product, data.products, 'Products');
  await restore(Message, data.messages, 'Messages');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Restore failed:', err.message);
  process.exit(1);
});