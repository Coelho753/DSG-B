const express = require("express");
const router = express.Router();
const mercadopago = require("mercadopago");

const Order = require("../models/Order");
const Cart = require("../models/Cart");

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

router.post("/mercadopago", async (req, res) => {

  try {

    console.log("🔔 Webhook recebido:", req.body);

    const { type, data } = req.body;

    if (type === "payment") {

      const paymentId = data.id;

      const payment = await mercadopago.payment.findById(paymentId);

      const paymentData = payment.body;

      console.log("💰 Status pagamento:", paymentData.status);

      if (paymentData.status === "approved") {

        const orderId = paymentData.metadata.order_id;

        const order = await Order.findById(orderId);

        if (!order) {
          console.log("❌ Pedido não encontrado");
          return res.sendStatus(200);
        }

        if (order.status !== "paid") {

          order.status = "paid";
          order.paymentId = paymentId;

          await order.save();

          console.log("✅ Pedido pago:", orderId);

          /* limpar carrinho */

          await Cart.findOneAndUpdate(
            { user: order.user },
            { items: [], total: 0 }
          );

        }

      }

    }

    res.sendStatus(200);

  } catch (error) {

    console.error("Erro webhook:", error);

    res.sendStatus(500);

  }

});

module.exports = router;