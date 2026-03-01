const axios = require("axios");

const baseURL = process.env.MELHOR_ENVIO_BASE;

const api = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
    "Content-Type": "application/json",
  },
});

exports.calculateShipping = async ({ zipcode, products }) => {
  try {

    const response = await api.post("/me/shipment/calculate", {
      from: {
        postal_code: "01001000", // CEP da sua loja
      },
      to: {
        postal_code: zipcode,
      },
      products: products.map(p => ({
        id: p._id,
        width: p.width,
        height: p.height,
        length: p.length,
        weight: p.weight,
        insurance_value: p.price,
        quantity: p.quantity,
      })),
    });

    return response.data;

  } catch (error) {
    console.error("Erro cálculo frete:", error.response?.data || error);
    throw new Error("Erro ao calcular frete");
  }
};