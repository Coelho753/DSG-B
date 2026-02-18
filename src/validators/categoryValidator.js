const { body } = require('express-validator');

const categoryValidator = [
  body().custom((value, { req }) => {
    const nome = req.body.nome || req.body.name;
    if (!nome || String(nome).trim().length < 2) {
      throw new Error('Nome da categoria é obrigatório (nome ou name)');
    }
    return true;
  }),
  body('parent').optional().isMongoId().withMessage('parent inválido'),
  body('parentId').optional().isMongoId().withMessage('parentId inválido'),
  body('icone').optional().isString(),
  body('icon').optional().isString(),
  body('ordemExibicao').optional().isInt({ min: 0 }).withMessage('ordemExibicao deve ser inteiro positivo'),
  body('displayOrder').optional().isInt({ min: 0 }).withMessage('displayOrder deve ser inteiro positivo'),
  body('ativo').optional().isBoolean().withMessage('ativo deve ser booleano'),
  body('status').optional().isIn(['ativo', 'inativo', 'active', 'inactive']).withMessage('status inválido'),
];

module.exports = {
  categoryValidator,
};
