const mercadopago = require("mercadopago");
const Order = require("../models/Order");

exports.mercadoPagoWebhook = async (req, res) => {

  try {

    const paymentId = req.query.id;

    if (!paymentId) {
      return res.sendStatus(200);
    }

    const payment = await mercadopago.payment.findById(paymentId);

    if (payment.body.status !== "approved") {
      return res.sendStatus(200);
    }

    const order = await Order.findOne({
      paymentId
    });

    if (!order) {
      return res.sendStatus(200);
    }

    order.status = "paid";

    await order.save();

    res.sendStatus(200);

  } catch (error) {

    console.error("Webhook erro:", error);

    res.sendStatus(500);

  }

};
