const cron = require("node-cron");
const Order = require("../models/Order");
const trackingService = require("../services/trackingService");

const startTrackingJob = () => {
  cron.schedule("*/30 * * * *", async () => {
    console.log("🔄 Verificando atualizações de rastreio...");

    const orders = await Order.find({
      trackingCode: { $exists: true },
      status: { $in: ["shipped", "out_for_delivery"] },
    });

    for (const order of orders) {
      try {
        const tracking = await trackingService.trackPackage(order.trackingCode);

        const latestStatus = tracking.status;

        if (latestStatus && latestStatus !== order.status) {
          order.status = latestStatus;

          order.statusHistory.push({
            status: latestStatus,
            description: "Atualização automática de rastreio",
            date: new Date(),
          });

          await order.save();

          console.log(`Pedido ${order._id} atualizado para ${latestStatus}`);
        }

      } catch (error) {
        console.error("Erro ao atualizar rastreio:", error.message);
      }
    }

  });
};

module.exports = startTrackingJob;
