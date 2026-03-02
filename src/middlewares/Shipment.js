const mongoose = require("mongoose");

const ShipmentSchema = new mongoose.Schema({
  orderId: String,
  melhorEnvioId: String,
  trackingCode: String,
  status: {
    type: String,
    default: "PENDENTE"
  },
  etiquetaGerada: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Shipment", ShipmentSchema);