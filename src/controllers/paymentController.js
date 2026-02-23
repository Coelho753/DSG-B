const { createPreference } = require("../services/mercadoPagoService");

exports.createPayment = async (req, res) => {
  try {
    const result = await createPreference({
      items: [
        {
          title: req.body.title,
          quantity: 1,
          unit_price: Number(req.body.unit_price),
          currency_id: "BRL",
        },
      ],
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};