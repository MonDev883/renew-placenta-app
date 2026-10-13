const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cat: { type: String, required: true },
  price: { type: String, default: "₱XX.XX" },
  size: { type: String, default: "" },
  blurb: { type: String, default: "" },
  best: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  outOfStock: { type: Boolean, default: false },
  scope: { type: String, default: "local" },
  imageUrl: { type: String, default: "" },
  images: { type: [String], default: [] },
  slideImageUrl: { type: String, default: "" },
  noSlide: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  shopeeUrl: { type: String, default: "" }, // 🛒 Stores the product's Shopee store link pasted by the admin
  lazadaUrl: { type: String, default: "" }, // 🛍️ Stores the product's Lazada store link pasted by the admin
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);