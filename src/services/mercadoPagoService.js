const { MercadoPagoConfig, Preference } = require("mercadopago");

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const createPreference = async (data) => {
  try {
    const preference = new Preference(client);

    const response = await preference.create({
      body: data,
    });

    return response;
  } catch (error) {
    console.error("Erro Mercado Pago:", error);
    throw error;
  }
};

module.exports = {
  createPreference,
};