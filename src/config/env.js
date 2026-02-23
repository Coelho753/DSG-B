/**
 * Configuração: centraliza leitura de ambiente e inicialização de infraestrutura.
 * Arquivo: src/config/env.js
 */
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret_dev',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_dev',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  bootstrapAdminToken: process.env.BOOTSTRAP_ADMIN_TOKEN || '',
  mpAccessToken: process.env.MP_ACCESS_TOKEN || '',
  mpPublicKey: process.env.MP_PUBLIC_KEY || '',
  mpWebhookSecret: process.env.MP_WEBHOOK_SECRET || '',
};
