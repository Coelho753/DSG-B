const { MercadoPagoConfig, Payment } = require("mercadopago");
const { v4: uuidv4 } = require("uuid");

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

const payment = new Payment(client);

async function createPayment(data) {
  return await payment.create({
    body: data,
    requestOptions: {
      idempotencyKey: uuidv4(), // 🔥 OBRIGATÓRIO
    },
  });
}

module.exports = { createPayment };