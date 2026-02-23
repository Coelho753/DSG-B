const mercadopago = require("mercadopago");

mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

const createPreference = async (data) => {
  const preference = {
    items: data.items,
    notification_url: process.env.BASE_URL + "/api/payments/webhook"
  };

  const response = await mercadopago.preferences.create(preference);
  return response.body;
};

module.exports = {
  createPreference
};