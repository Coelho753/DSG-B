const axios = require("axios");

exports.trackPackage = async (trackingCode) => {
  try {

    const response = await axios.get(
      `https://api.melhorenvio.com.br/api/v2/me/shipment/tracking/${trackingCode}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
        },
      }
    );

    return response.data;

  } catch (error) {
    console.error("Erro rastreio:", error.response?.data || error);
    throw new Error("Erro ao rastrear");
  }
};