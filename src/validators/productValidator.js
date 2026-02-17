const { body } = require('express-validator');

const productValidator = [
  body().custom((value, { req }) => {
    const nome = req.body.nome || req.body.name;
    const preco = req.body.preco ?? req.body.price;
    const estoque = req.body.estoque ?? req.body.stock;
    const categoria = req.body.categoria || req.body.category || req.body.categoryId;

    if (!nome || String(nome).trim().length < 2) throw new Error('Nome é obrigatório');
    if (Number.isNaN(Number(preco)) || Number(preco) < 0) throw new Error('Preço inválido');
    if (!Number.isInteger(Number(estoque)) || Number(estoque) < 0) throw new Error('Estoque inválido');
    if (!categoria) throw new Error('Categoria é obrigatória');

    return true;
  }),
  body('descricao').optional().isString(),
  body('descricaoDetalhada').optional().isString(),
  body('sku').optional().isString(),
  body('destaque').optional().isBoolean(),
  body('promocao.tipo').optional().isIn(['percentual', 'fixo']),
  body('promocao.valor').optional().isFloat({ min: 0 }),
];

module.exports = {
  productValidator,
};
