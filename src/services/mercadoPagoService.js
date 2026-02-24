const { MercadoPagoConfig, Preference } = require("mercadopago");

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

exports.createPreference = async (items) => {
  const preference = new Preference(client);

  const response = await preference.create({
    body: {
      items,
    },
  });

  return response;
};