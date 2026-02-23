/**
 * Model: define o schema/estrutura persistida no MongoDB via Mongoose.
 * Arquivo: src/models/Promotion.js
 */
const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Promotion', promotionSchema);
