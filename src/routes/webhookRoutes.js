const express = require("express");
const router = express.Router();
const axios = require("axios");

const Order = require("../models/Order");
const Cart = require("../models/Cart");

router.post("/mercadopago", async (req, res) => {

  try {

    console.log("🔔 Webhook recebido:", req.body);

    const { type, data } = req.body;

    if (type !== "payment") {
      return res.sendStatus(200);
    }

    const paymentId = data.id;

    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    const payment = response.data;

    const orderId = payment.metadata?.order_id;

    if (!orderId) {
      console.log("⚠️ Pagamento sem order_id");
      return res.sendStatus(200);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      console.log("❌ Pedido não encontrado");
      return res.sendStatus(200);
    }

    if (order.status === "paid") {
      return res.sendStatus(200);
    }

    if (payment.status === "approved") {

      order.status = "paid";

      order.payment.status = payment.status;
      order.payment.status_detail = payment.status_detail;
      order.payment.paymentId = payment.id;

      await order.save();

      console.log("✅ Pedido pago:", orderId);

      await Cart.findOneAndUpdate(
        { user: order.user },
        { items: [], total: 0 }
      );
    }

    res.sendStatus(200);

  } catch (error) {

    console.error("🚨 ERRO WEBHOOK:", error.response?.data || error.message);

    res.sendStatus(500);

  }

});

module.exports = router;