const axios = require("axios");
const MelhorEnvioToken = require("../models/MelhorEnvioToken");

const BASE_URL = "https://api.melhorenvio.com.br";

// 🔹 Função para salvar token no banco
async function saveToken(data) {
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await MelhorEnvioToken.deleteMany({});

  await MelhorEnvioToken.create({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
  });
}

// 🔹 Solicita novo token (primeira vez)
async function generateToken() {
  const response = await axios.post(
    `${BASE_URL}/oauth/token`,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.MELHOR_ENVIO_CLIENT_ID,
      client_secret: process.env.MELHOR_ENVIO_CLIENT_SECRET,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  await saveToken(response.data);

  return response.data.access_token;
}

// 🔹 Renova usando refresh_token
async function refreshToken(refreshTokenValue) {
  const response = await axios.post(
    `${BASE_URL}/oauth/token`,
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshTokenValue,
      client_id: process.env.MELHOR_ENVIO_CLIENT_ID,
      client_secret: process.env.MELHOR_ENVIO_CLIENT_SECRET,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  await saveToken(response.data);

  return response.data.access_token;
}

// 🔹 Retorna token válido automaticamente
async function getValidToken() {
  const tokenDoc = await MelhorEnvioToken.findOne();

  if (!tokenDoc) {
    return await generateToken();
  }

  const now = new Date();

  // Renova se faltar menos de 5 minutos para expirar
  const bufferTime = 5 * 60 * 1000;

  if (tokenDoc.expiresAt.getTime() - now.getTime() < bufferTime) {
    if (tokenDoc.refreshToken) {
      return await refreshToken(tokenDoc.refreshToken);
    } else {
      return await generateToken();
    }
  }

  return tokenDoc.accessToken;
}

module.exports = {
  getValidToken,
};