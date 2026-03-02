const Shipment = require('../models/Shipment');
const { melhorEnvioRequest } = require('./melhorEnvioService');

async function gerarEtiqueta(order) {
  // 1️⃣ Criar envio
  const response = await melhorEnvioRequest(
    "POST",
    "/api/v2/me/shipment",
    {
      service: order.shippingServiceId,
      from: {
        postal_code: process.env.STORE_POSTAL_CODE,
      },
      to: {
        postal_code: order.shippingAddress.postalCode,
        name: order.user.name,
      },
      products: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitary_value: item.unitPrice,
        weight: 0.3,
        width: 15,
        height: 10,
        length: 20,
      })),
    }
  );

  const shipmentId = response.data.id;

  // 2️⃣ Comprar etiqueta
  await melhorEnvioRequest(
    "POST",
    "/api/v2/me/shipment/checkout",
    { orders: [shipmentId] }
  );

  // 3️⃣ Gerar etiqueta
  await melhorEnvioRequest(
    "POST",
    "/api/v2/me/shipment/generate",
    { orders: [shipmentId] }
  );

  // 4️⃣ Buscar dados do envio
  const shipmentData = await melhorEnvioRequest(
    "GET",
    `/api/v2/me/shipment/${shipmentId}`
  );

  await Shipment.create({
    orderId: order._id,
    melhorEnvioId: shipmentId,
    trackingCode: shipmentData.data.tracking,
    status: shipmentData.data.status,
  });

  order.shipmentStatus = shipmentData.data.status;
  await order.save();
}

module.exports = { gerarEtiqueta };