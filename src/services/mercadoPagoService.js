const { MercadoPagoConfig, Preference } = require("mercadopago");

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const createPreference = async (data) => {
  const preference = new Preference(client);
  return await preference.create({ body: data });
};

module.exports = { createPreference };