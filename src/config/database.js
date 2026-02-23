/**
 * Configuração: centraliza leitura de ambiente e inicialização de infraestrutura.
 * Arquivo: src/config/database.js
 */
const mongoose = require('mongoose');
const env = require('./env');

const connectDatabase = async () => {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI não definido no .env');
  }

  await mongoose.connect(env.mongoUri);
  // Log simples para facilitar monitoramento em ambiente de desenvolvimento.
  // Em produção, prefira uma lib de logging estruturado.
  // eslint-disable-next-line no-console
  console.log('MongoDB conectado com sucesso');
};

module.exports = connectDatabase;
