const { body } = require('express-validator');

const resolveName = (b = {}) => b.nome || b.name || b.fullName || b.nomeCompleto || b.username;
const resolvePassword = (b = {}) => b.senha || b.password;
const resolveEmail = (b = {}) => b.email || b.userEmail;

const registerValidator = [
  body().custom((value, { req }) => {
    const nome = resolveName(req.body);
    const senha = resolvePassword(req.body);
    const email = resolveEmail(req.body);

    if (!nome || String(nome).trim().length < 2) {
      throw new Error('Nome deve ter ao menos 2 caracteres (nome|name|fullName|nomeCompleto|username)');
    }

    if (!email || !String(email).includes('@')) {
      throw new Error('Email é obrigatório (email ou userEmail)');
    }

    if (!senha || String(senha).length < 6) {
      throw new Error('Senha deve ter ao menos 6 caracteres (senha ou password)');
    }

    return true;
  }),
  body('email').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('userEmail').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('role').optional().isIn(['user', 'admin', 'distribuidor', 'revendedor']),
];

const loginValidator = [
  body().custom((value, { req }) => {
    const email = resolveEmail(req.body);
    const senha = resolvePassword(req.body);

    if (!email || !String(email).includes('@')) {
      throw new Error('Email é obrigatório (email ou userEmail)');
    }

    if (!senha) throw new Error('Senha é obrigatória (senha ou password)');
    return true;
  }),
  body('email').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('userEmail').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
];

const refreshTokenValidator = [
  body('refreshToken').notEmpty().withMessage('refreshToken é obrigatório'),
];

const bootstrapAdminValidator = [
  ...registerValidator,
  body('bootstrapToken').optional().isString().withMessage('bootstrapToken inválido'),
];

module.exports = {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  bootstrapAdminValidator,
};
