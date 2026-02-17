const { body } = require('express-validator');

const categoryValidator = [
  body('nome').isLength({ min: 2 }).withMessage('Nome da categoria é obrigatório'),
  body('parent').optional().isMongoId().withMessage('parent inválido'),
  body('icone').optional().isString(),
  body('ordemExibicao').optional().isInt({ min: 0 }).withMessage('ordemExibicao deve ser inteiro positivo'),
  body('ativo').optional().isBoolean().withMessage('ativo deve ser booleano'),
];

module.exports = {
  categoryValidator,
};
