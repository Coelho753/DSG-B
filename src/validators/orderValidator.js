const { body } = require('express-validator');

const createOrderValidator = [
  body('produtos').isArray({ min: 1 }).withMessage('Informe ao menos um produto'),
  body('produtos.*.product').isMongoId().withMessage('ID de produto inválido'),
  body('produtos.*.quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
];

module.exports = {
  createOrderValidator,
};
