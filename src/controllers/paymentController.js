const { createPreference } = require("../services/mercadoPagoService");

const createPayment = async (req, res) => {
  try {
    const preferenceData = {
      items: [
        {
          title: req.body.title || "Produto",
          quantity: req.body.quantity || 1,
          unit_price: Number(req.body.unit_price) || 0,
          currency_id: "BRL",
        },
      ],
    };

    const result = await createPreference(preferenceData);

    res.json({
      id: result.id,
      init_point: result.init_point,
    });
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
};

module.exports = {
  createPayment,
};