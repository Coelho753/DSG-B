const { createPreference } = require("../services/mercadoPagoService");

exports.createPayment = async (req, res) => {
  try {
    const { items } = req.body;

    const result = await createPreference(items);

    res.json({
      id: result.id,
      init_point: result.init_point,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar pagamento" });
  }
};