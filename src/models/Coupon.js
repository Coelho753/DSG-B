const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({

  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  type: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true
  },

  value: {
    type: Number,
    required: true
  },

  minOrderValue: {
    type: Number,
    default: 0
  },

  maxDiscount: {
    type: Number
  },

  expiresAt: {
    type: Date
  },

  usageLimit: {
    type: Number,
    default: null
  },

  usedCount: {
    type: Number,
    default: 0
  },

  active: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Coupon", CouponSchema);