const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    title: String,
    discount: Number,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);