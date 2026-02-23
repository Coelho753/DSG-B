const mercadoPagoService = require('../services/mercadoPagoService');

const createPayment = async (req, res) => {
  try {
    const result = await mercadoPagoService.createPreference(req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
};

module.exports = {
  createPayment
};