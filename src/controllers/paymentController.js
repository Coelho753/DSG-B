const mercadopago = require("mercadopago");
const Order = require("../models/Order");

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

exports.createPixPayment = async (req, res) => {

  try {

    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Pedido não encontrado"
      });
    }

    const payment = await mercadopago.payment.create({

      transaction_amount: Number(order.total),

      description: `Pedido ${order._id}`,

      payment_method_id: "pix",

      payer: {
        email: "cliente@email.com"
      }

    });

    order.paymentId = payment.body.id;

    await order.save();

    const qr = payment.body.point_of_interaction.transaction_data;

    res.json({
      qr_code: qr.qr_code,
      qr_code_base64: qr.qr_code_base64
    });

  } catch (error) {

    console.error("Erro pagamento PIX:", error);

    res.status(500).json({
      message: "Erro ao criar pagamento"
    });

  }

};