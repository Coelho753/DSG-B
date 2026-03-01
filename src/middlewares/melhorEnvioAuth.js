const { getValidToken } = require("../services/melhorEnvioService");

module.exports = async (req, res, next) => {
  try {
    const token = await getValidToken();
    req.melhorEnvioToken = token;
    next();
  } catch (error) {
    console.error("Erro ao validar token Melhor Envio:", error.message);
    res.status(500).json({ error: "Erro ao autenticar com Melhor Envio" });
  }
};