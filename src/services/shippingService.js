const Shipment = require('../models/Shipment');
const { melhorEnvioRequest } = require('./melhorEnvioService');

async function gerarEtiqueta(order) {

  const response = await melhorEnvioRequest(
    "POST",
    "/api/v2/me/shipment",
    {
      service: order.shippingServiceId,

      from: {
        postal_code: process.env.STORE_POSTAL_CODE
      },

      to: {
        postal_code: order.shippingAddress.zipCode,
        name: order.user?.name || "Cliente"
      },

      products: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitary_value: item.unitPrice,
        weight: 0.3,
        width: 15,
        height: 10,
        length: 20
      }))
    }
  );

  const shipmentId = response.data.id;

  await melhorEnvioRequest(
    "POST",
    "/api/v2/me/shipment/checkout",
    { orders: [shipmentId] }
  );

  await melhorEnvioRequest(
    "POST",
    "/api/v2/me/shipment/generate",
    { orders: [shipmentId] }
  );

  const shipmentData = await melhorEnvioRequest(
    "GET",
    `/api/v2/me/shipment/${shipmentId}`
  );

  await Shipment.create({
    orderId: order._id,
    melhorEnvioId: shipmentId,
    trackingCode: shipmentData.data.tracking,
    status: shipmentData.data.status
  });

  order.shipmentStatus = shipmentData.data.status;

  await order.save();
}

module.exports = { gerarEtiqueta };