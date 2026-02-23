/**
 * Middleware: intercepta o ciclo da requisição para autenticação, validação e tratamento transversal.
 * Arquivo: src/middlewares/validateRequest.js
 */
const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const mapped = errors.array();
    return res.status(400).json({
      message: mapped[0]?.msg || 'Dados inválidos',
      errors: mapped,
    });
  }
  return next();
};

module.exports = validateRequest;
