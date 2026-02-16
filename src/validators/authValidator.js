const { body } = require('express-validator');

const registerValidator = [
  body().custom((value, { req }) => {
    const nome = req.body.nome || req.body.name;
    const senha = req.body.senha || req.body.password;

    if (!nome || String(nome).trim().length < 2) {
      throw new Error('Nome deve ter ao menos 2 caracteres (nome ou name)');
    }

    if (!senha || String(senha).length < 6) {
      throw new Error('Senha deve ter ao menos 6 caracteres (senha ou password)');
    }

    return true;
  }),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('role').optional().isIn(['user', 'admin', 'distribuidor', 'revendedor']),
];

const loginValidator = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body().custom((value, { req }) => {
    const senha = req.body.senha || req.body.password;
    if (!senha) throw new Error('Senha é obrigatória (senha ou password)');
    return true;
  }),
];

const refreshTokenValidator = [
  body('refreshToken').notEmpty().withMessage('refreshToken é obrigatório'),
];

module.exports = {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
};
