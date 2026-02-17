const { body } = require('express-validator');

const createOrderValidator = [
  body().custom((value, { req }) => {
    const produtos = req.body.produtos || req.body.items;
    if (!Array.isArray(produtos) || !produtos.length) {
      throw new Error('Informe ao menos um produto (produtos ou items)');
    }
    return true;
  }),
  body('produtos.*.product').optional().isMongoId().withMessage('ID de produto inválido'),
  body('items.*.product').optional().isMongoId().withMessage('ID de produto inválido'),
  body('produtos.*.quantidade').optional().isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
  body('items.*.quantidade').optional().isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
];

module.exports = {
  createOrderValidator,
};
