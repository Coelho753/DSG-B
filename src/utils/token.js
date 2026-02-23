/**
 * Utilitário: funções auxiliares compartilhadas por diferentes camadas do backend.
 * Arquivo: src/utils/token.js
 */
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
    jwtid: uuidv4(),
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
    jwtid: uuidv4(),
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
