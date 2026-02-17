const { body } = require('express-validator');

const productValidator = [
  body('nome').isLength({ min: 2 }).withMessage('Nome é obrigatório'),
  body('preco').isFloat({ min: 0 }).withMessage('Preço inválido'),
  body('estoque').isInt({ min: 0 }).withMessage('Estoque inválido'),
  body('categoria').isMongoId().withMessage('Categoria inválida'),
  body('promocao.tipo').optional().isIn(['percentual', 'fixo']),
  body('promocao.valor').optional().isFloat({ min: 0 }),
];

module.exports = {
  productValidator,
};
