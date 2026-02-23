/**
 * Model: define o schema/estrutura persistida no MongoDB via Mongoose.
 * Arquivo: src/models/Product.js
 */
import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },

    imageUrl: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    stock: {
      type: Number,
      default: -1 // -1 = estoque infinito
    },

    soldCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
)

export default mongoose.model("Product", productSchema)