const { calcularFrete } = require("../services/freteService");
const { ok, fail } = require("../utils/apiResponse");

const calcular = async (req, res) => {
  try {
    const { cep, products } = req.body;

    if (!cep) {
      return fail(res, "CEP é obrigatório", 400);
    }

    if (!Array.isArray(products) || !products.length) {
      return fail(res, "Produtos são obrigatórios", 400);
    }

    const shippingOptions = await calcularFrete({
      from: {
        postal_code: process.env.STORE_POSTAL_CODE,
      },
      to: {
        postal_code: cep,
      },
      products: products.map((p) => ({
        name: "Produto",
        quantity: p.quantity,
        unitary_value: 100,
        weight: p.weight,
        width: p.width,
        height: p.height,
        length: p.length,
      })),
    });

    return ok(res, shippingOptions);

  } catch (error) {
    console.error("Erro no cálculo de frete:", error.message);
    return fail(res, "Falha no cálculo de frete", 500);
  }
};

module.exports = { calcular };