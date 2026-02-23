/**
 * Model: define o schema/estrutura persistida no MongoDB via Mongoose.
 * Arquivo: src/models/Promotion.js
 */
import mongoose from "mongoose"

const promotionSchema = new mongoose.Schema(
  {
    productId: {
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

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

export default mongoose.model("Promotion", promotionSchema)