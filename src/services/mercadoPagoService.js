/**
 * Service: concentra regras de negócio reutilizáveis e integrações externas.
 * Arquivo: src/services/mercadoPagoService.js
 */
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// Cria cliente do Mercado Pago sempre a partir de variáveis de ambiente.
const getClient = () => {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MP_ACCESS_TOKEN não configurado');
  }

  return new MercadoPagoConfig({ accessToken });
};

// Cria uma preferência de checkout e retorna resposta completa da API.
const createPreference = async (payload) => {
  const client = getClient();
  const preference = new Preference(client);
  return preference.create({ body: payload });
};

// Consulta um pagamento específico para validar status no webhook.
const getPayment = async (paymentId) => {
  const client = getClient();
  const payment = new Payment(client);
  return payment.get({ id: String(paymentId) });
};

module.exports = {
  createPreference,
  getPayment,
};
