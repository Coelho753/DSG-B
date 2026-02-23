/**
 * Middleware: intercepta o ciclo da requisição para autenticação, validação e tratamento transversal.
 * Arquivo: src/middlewares/rateLimiter.js
 */
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas requisições. Tente novamente em alguns minutos.',
});

module.exports = apiLimiter;
