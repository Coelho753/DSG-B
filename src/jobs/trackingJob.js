const cron = require("node-cron");
const Shipment = require("../models/Shipment");
const { melhorEnvioRequest } = require("../services/melhorEnvioService");

function startTrackingJob() {
  cron.schedule("*/30 * * * *", async () => {
    console.log("🔄 Verificando rastreios...");

    const shipments = await Shipment.find({
      etiquetaGerada: true,
      status: { $ne: "ENTREGUE" }
    });

    for (let shipment of shipments) {
      try {
        const response = await melhorEnvioRequest(
          "GET",
          `/api/v2/me/shipment/tracking/${shipment.melhorEnvioId}`
        );

        const statusAtual = response.data.status;

        shipment.status = statusAtual;
        shipment.trackingCode = response.data.tracking;
        await shipment.save();

      } catch (error) {
        console.error("Erro rastreando:", error.message);
      }
    }

  });
}

module.exports = startTrackingJob;