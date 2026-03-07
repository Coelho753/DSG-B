const express = require("express");
const router = express.Router();
const axios = require("axios");

const Order = require("../models/Order");
const Cart = require("../models/Cart");

router.post("/mercadopago", async (req, res) => {
  try {

    console.log("🔔 Webhook recebido:", req.body);

    const { type, data } = req.body;

    // Mercado Pago envia vários tipos de eventos
    if (type !== "payment") {
      return res.sendStatus(200);
    }

    if (!data || !data.id) {
      console.log("⚠️ Webhook sem payment id");
      return res.sendStatus(200);
    }

    const paymentId = data.id;

    // Buscar pagamento na API
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
        }
      }
    );

    const payment = response.data;

    const orderId = payment?.metadata?.order_id;

    if (!orderId) {
      console.log("⚠️ Pagamento sem order_id no metadata");
      return res.sendStatus(200);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      console.log("❌ Pedido não encontrado:", orderId);
      return res.sendStatus(200);
    }

    // Evitar processar duas vezes
    if (order.status === "paid") {
      console.log("⚠️ Pedido já estava pago:", orderId);
      return res.sendStatus(200);
    }

    // Atualizar pedido
    if (payment.status === "approved") {

      order.status = "paid";

      order.payment.status = payment.status;
      order.payment.status_detail = payment.status_detail;
      order.payment.paymentId = payment.id;

      await order.save();

      console.log("✅ Pedido pago:", orderId);

      // Limpar carrinho do usuário
      await Cart.findOneAndUpdate(
        { user: order.user },
        { items: [], total: 0 }
      );
    }

    return res.sendStatus(200);

  } catch (error) {

    console.error("🚨 ERRO WEBHOOK:", error.response?.data || error.message);

    return res.sendStatus(500);

  }
});

module.exports = router;