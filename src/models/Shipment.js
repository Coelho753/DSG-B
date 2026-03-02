const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  melhorEnvioId: String,
  trackingCode: String,
  status: String,
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);