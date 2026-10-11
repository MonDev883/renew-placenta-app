const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  email: { type: String, required: true },
  otpCode: { type: String },
  otpExpires: { type: Date },
  resetCodeHash: String,
  resetExpires: Date,
  resetAttempts: { type: Number, default: 0 },
});

module.exports = mongoose.model('Admin', adminSchema);