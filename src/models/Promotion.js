const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);