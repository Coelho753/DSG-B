const { MercadoPagoConfig, Payment } = require("mercadopago");
const { v4: uuidv4 } = require("uuid");

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

const payment = new Payment(client);

async function createPayment(data) {
  try {
    const response = await payment.create({
      body: {
        transaction_amount: Number(data.amount),
        description: data.items?.[0]?.title || "Compra",
        payment_method_id: data.payment_method_id,
        payer: {
          email: data.email,
        },
      },
      requestOptions: {
        idempotencyKey: uuidv4(), // 🔥 OBRIGATÓRIO
      },
    });

    return response;
  } catch (error) {
    console.error("ERRO MERCADO PAGO:", error);
    throw error;
  }
}

module.exports = { createPayment };