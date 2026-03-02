const cron = require('node-cron');
const Shipment = require('../models/Shipment');
const { melhorEnvioRequest } = require('../services/melhorEnvioService');

function startTrackingCron() {
  cron.schedule('*/30 * * * *', async () => {
    console.log("🔄 Atualizando rastreios...");

    const shipments = await Shipment.find({
      status: { $nin: ['delivered', 'cancelled'] }
    });

    for (const shipment of shipments) {
      const response = await melhorEnvioRequest(
        "GET",
        `/api/v2/me/shipment/${shipment.melhorEnvioId}`
      );

      shipment.status = response.data.status;
      shipment.trackingCode = response.data.tracking;
      await shipment.save();
    }
  });
}

module.exports = { startTrackingCron };