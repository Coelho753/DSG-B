const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    street: String,
    number: String,
    city: String,
    state: String,
    zipCode: String,
    complement: String
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    name: String,

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    items: [orderItemSchema],

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    shipping: {
      type: Number,
      default: 0
    },

    total: {
      type: Number,
      required: true,
      min: 0
    },

    /**
     * Endereço de entrega
     */
    shippingAddress: addressSchema,

    /**
     * Dados do frete
     */

    shippingServiceId: String,

    shippingCompany: String,

    shippingEstimatedDays: Number,

    shipmentStatus: {
      type: String,
      default: "pending"
    },

    /**
     * Status do pedido
     */

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
      index: true
    },

    /**
     * Pagamento
     */

    externalReference: {
      type: String,
      index: true
    },

    paymentId: {
      type: String,
      index: true
    },

    paidAt: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", orderSchema);