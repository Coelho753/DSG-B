const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Promotion", promotionSchema);