const freteService = require("../services/freteService");

async function calcular(req, res) {
  try {
    const resultado = await freteService.calcularFrete(req.body);
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  calcular,
};