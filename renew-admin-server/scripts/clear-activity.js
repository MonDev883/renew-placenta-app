const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');

const args = process.argv.slice(2);
const all = args.includes('--all');
const beforeArg = args.find((a) => a.startsWith('--before='));
const confirm = args.includes('--confirm');

if (!all && !beforeArg) {
  console.log('Usage:');
  console.log('  node scripts/clear-activity.js --all [--confirm]');
  console.log('  node scripts/clear-activity.js --before=2026-10-16 [--confirm]');
  process.exit(1);
}

let filter = {};
if (beforeArg) {
  const date = new Date(beforeArg.split('=')[1]);
  if (isNaN(date)) {
    console.error('Invalid date. Use the format YYYY-MM-DD.');
    process.exit(1);
  }
  filter = { createdAt: { $lt: date } };
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await ActivityLog.countDocuments(filter);

  if (!confirm) {
    console.log(`${count} entries would be deleted. Add --confirm to delete them.`);
  } else {
    const result = await ActivityLog.deleteMany(filter);
    console.log(`Deleted ${result.deletedCount} entries.`);
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});