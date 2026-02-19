const { body } = require('express-validator');

const resolveImageInfo = (req) => {
  const imageUrl = req.body.imageUrl || req.body.image || req.body.imagem;
  const uploadedImageCount = req.files?.length || 0;
  return { imageUrl, uploadedImageCount };
};

const productCreateValidator = [
  body().custom((value, { req }) => {
    const nome = req.body.nome || req.body.name;
    const preco = req.body.preco ?? req.body.price;
    const estoque = req.body.estoque ?? req.body.stock;
    const categoria = req.body.categoria || req.body.category || req.body.categoryId;
    const { imageUrl, uploadedImageCount } = resolveImageInfo(req);

    if (!nome || String(nome).trim().length < 2) throw new Error('Nome é obrigatório');
    if (Number.isNaN(Number(preco)) || Number(preco) < 0) throw new Error('Preço inválido');
    if (req.body.cost !== undefined && (Number.isNaN(Number(req.body.cost)) || Number(req.body.cost) < 0)) throw new Error('Custo inválido');
    if (!Number.isInteger(Number(estoque)) || Number(estoque) < 0) throw new Error('Estoque inválido');
    if (!categoria) throw new Error('Categoria é obrigatória');
    if (!imageUrl && uploadedImageCount === 0) throw new Error('Imagem do produto é obrigatória');

    return true;
  }),
  body('descricao').optional().isString(),
  body('descricaoDetalhada').optional().isString(),
  body('sku').optional().isString(),
  body('destaque').optional().isBoolean(),
  body('promocao.tipo').optional().isIn(['percentual', 'fixo']),
  body('promocao.valor').optional().isFloat({ min: 0 }),
];

const productUpdateValidator = [
  body().custom((value, { req }) => {
    const numericFields = ['preco', 'price', 'cost', 'estoque', 'stock'];
    for (const field of numericFields) {
      if (req.body[field] !== undefined && Number.isNaN(Number(req.body[field]))) {
        throw new Error(`Campo numérico inválido: ${field}`);
      }
    }
    return true;
  }),
  body('descricao').optional().isString(),
  body('descricaoDetalhada').optional().isString(),
  body('sku').optional().isString(),
  body('destaque').optional().isBoolean(),
];

module.exports = {
  productCreateValidator,
  productUpdateValidator,
};
