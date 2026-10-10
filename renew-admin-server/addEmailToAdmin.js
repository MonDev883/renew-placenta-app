const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const USERNAME = 'Renew';
const EMAIL = 'vanezza@renewplacenta.com';

async function run(){
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await Admin.findOneAndUpdate({ username: USERNAME }, { email: EMAIL }, { new: true });
  console.log(admin ? `Updated ${admin.username} with email ${admin.email}` : 'Admin not found');
  process.exit(0);
}

run();