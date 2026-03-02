const axios = require("axios");
const MelhorEnvioToken = require("../models/MelhorEnvioToken");

const BASE_URL = process.env.MELHOR_ENVIO_BASE_URL;

// 🔹 Salva token no banco
async function saveToken(data) {
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await MelhorEnvioToken.deleteMany({});

  await MelhorEnvioToken.create({
    accessToken: data.access_token,
    expiresAt,
  });
}

// 🔹 Gera novo token
async function generateToken() {
  try {
    const response = await axios.post(
      `${BASE_URL}/oauth/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.MELHOR_ENVIO_CLIENT_ID,
        client_secret: process.env.MELHOR_ENVIO_CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      }
    );

    await saveToken(response.data);

    return response.data.access_token;

  } catch (error) {
    console.error("Erro ao gerar token Melhor Envio:", error.response?.data || error.message);
    throw new Error("Falha na autenticação com Melhor Envio");
  }
}

// 🔹 Retorna token válido automaticamente
async function getValidToken() {
  const tokenDoc = await MelhorEnvioToken.findOne();

  if (!tokenDoc) {
    return await generateToken();
  }

  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minutos antes de expirar

  if (tokenDoc.expiresAt.getTime() - now.getTime() < bufferTime) {
    return await generateToken();
  }

  return tokenDoc.accessToken;
}

module.exports = {
  getValidToken,
};