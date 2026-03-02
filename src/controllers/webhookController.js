const Order = require('../models/Order');
const Shipment = require('../models/Shipment');
const { gerarEtiqueta } = require('../services/shipmentService');

const mercadoPagoWebhook = async (req, res) => {
  try {
    const payment = req.body.data;

    if (!payment?.id) return res.sendStatus(200);

    const order = await Order.findOne({
      mercadoPagoPaymentId: payment.id,
    });

    if (!order) return res.sendStatus(200);

    if (payment.status === 'approved') {
      order.status = 'paid';
      order.paidAt = new Date();
      await order.save();

      // 🔥 GERA ETIQUETA AUTOMATICAMENTE
      await gerarEtiqueta(order);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

module.exports = { mercadoPagoWebhook };