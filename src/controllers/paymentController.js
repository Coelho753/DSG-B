const { MercadoPagoConfig, Payment } = require("mercadopago");

const Order = require("../models/Order");

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

const payment = new Payment(client);


/*
==============================
CRIAR PAGAMENTO PIX
==============================
*/
exports.createPixPayment = async (req, res) => {

  try {

    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Pedido não encontrado"
      });
    }

    const paymentData = {
      transaction_amount: Number(order.total),
      description: `Pedido ${order._id}`,
      payment_method_id: "pix",
      payer: {
        email: "cliente@email.com"
      }
    };

    const result = await payment.create({
      body: paymentData
    });

    order.paymentId = result.id;

    await order.save();

    const qr = result.point_of_interaction.transaction_data;

    res.json({
      qr_code: qr.qr_code,
      qr_code_base64: qr.qr_code_base64
    });

  } catch (error) {

    console.error("Erro ao criar PIX:", error);

    res.status(500).json({
      message: "Erro ao gerar PIX"
    });

  }

};