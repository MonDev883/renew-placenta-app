const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function run(){
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find().sort({ createdAt: 1 });
  for (let i = 0; i < products.length; i++) {
    products[i].order = i;
    await products[i].save();
  }
  console.log(`Assigned order to ${products.length} products.`);
  process.exit(0);
}

run();