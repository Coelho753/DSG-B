const { body } = require('express-validator');

const productValidator = [
  body().custom((value, { req }) => {
    const nome = req.body.nome || req.body.name;
    const preco = req.body.preco ?? req.body.price;
    const estoque = req.body.estoque ?? req.body.stock;
    const categoria = req.body.categoria || req.body.category || req.body.categoryId;

    if (!nome || String(nome).trim().length < 2) throw new Error('Nome é obrigatório (nome ou name)');
    if (Number.isNaN(Number(preco)) || Number(preco) < 0) throw new Error('Preço inválido (preco ou price)');
    if (!Number.isInteger(Number(estoque)) || Number(estoque) < 0) throw new Error('Estoque inválido (estoque ou stock)');
    if (!categoria) throw new Error('Categoria é obrigatória (categoria, category ou categoryId)');

    return true;
  }),
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
