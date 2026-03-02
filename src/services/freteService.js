const { melhorEnvioRequest } = require("./melhorEnvioService");

async function calcularFrete({ from, to, products }) {
  try {
    const response = await melhorEnvioRequest(
      "POST",
      "/api/v2/me/shipment/calculate",
      {
        from,
        to,
        products,
      }
    );

    return response.data;

  } catch (error) {
    console.error("Erro ao calcular frete:", error.response?.data || error.message);
    throw new Error("Falha no cálculo de frete");
  }
}

module.exports = {
  calcularFrete,
};