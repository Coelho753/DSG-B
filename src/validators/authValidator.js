const { body } = require('express-validator');

const registerValidator = [
  body('nome').isLength({ min: 2 }).withMessage('Nome deve ter ao menos 2 caracteres'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter ao menos 6 caracteres'),
  body('role').optional().isIn(['user', 'admin', 'distribuidor', 'revendedor']),
];

const loginValidator = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('senha').notEmpty().withMessage('Senha é obrigatória'),
];

const refreshTokenValidator = [
  body('refreshToken').notEmpty().withMessage('refreshToken é obrigatório'),
];

module.exports = {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
};
