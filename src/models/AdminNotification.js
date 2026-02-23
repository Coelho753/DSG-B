/**
 * Model: define o schema/estrutura persistida no MongoDB via Mongoose.
 * Arquivo: src/models/AdminNotification.js
 */
const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['sale'], required: true, index: true },
  productName: { type: String, required: true },
  paidAt: { type: Date, required: true, index: true },
  totalPaid: { type: Number, required: true },
  profit: { type: Number, required: true },
  shippingAddress: { type: Object, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
