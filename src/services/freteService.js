const { melhorEnvioRequest } = require("./melhorEnvioService");

async function calcularFrete(data) {
  try {
    const response = await melhorEnvioRequest(
      "POST",
      "/api/v2/me/shipment/calculate",
      data
    );

    return response;

  } catch (error) {
    console.error("Erro Melhor Envio:", error.message);

    // 🔥 FALLBACK AUTOMÁTICO
    return [
      {
        id: "simulado",
        name: "Frete Econômico",
        company: { name: "Correios" },
        price: "19.90",
        delivery_time: 7,
      }
    ];
  }
}

module.exports = { calcularFrete };