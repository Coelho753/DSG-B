const { MercadoPagoConfig, Payment } = require("mercadopago");
const Order = require("../models/Order");

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

const payment = new Payment(client);


/*
========================
CRIAR PAGAMENTO PIX
========================
*/

exports.createPayment = async (req, res) => {

  try {

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "orderId é obrigatório"
      });
    }

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
      paymentId: result.id,
      qr_code: qr.qr_code,
      qr_code_base64: qr.qr_code_base64
    });

  } catch (error) {

    console.error("Erro ao criar pagamento:", error);

    res.status(500).json({
      message: "Erro ao criar pagamento"
    });

  }

};