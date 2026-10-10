const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const USERNAME = 'Renew';
const PASSWORD = '19RenewPlacenta98-Grace';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await Admin.findOne({ username: USERNAME });
  if (existing) {
    console.log('Admin already exists.');
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  await Admin.create({ username: USERNAME, passwordHash });
  console.log(`Admin created — username: ${USERNAME}, password: ${PASSWORD}`);
  process.exit(0);
}

seed();