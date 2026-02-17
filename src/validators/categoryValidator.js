const { body } = require('express-validator');

const categoryValidator = [
  body('nome').isLength({ min: 2 }).withMessage('Nome da categoria é obrigatório'),
  body('ativo').optional().isBoolean().withMessage('ativo deve ser booleano'),
];

module.exports = {
  categoryValidator,
};
