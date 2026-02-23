/**
 * Validator: define regras de validação para payloads de entrada das APIs.
 * Arquivo: src/validators/productValidator.js
 */
const { body } = require('express-validator');

const resolveImageInfo = (req) => {
  const imageUrl = req.body.imageUrl || req.body.image;
  const uploadedImageCount = req.files?.length || 0;
  return { imageUrl, uploadedImageCount };
};

const productCreateValidator = [
  body().custom((value, { req }) => {
    const { name, description, price, stock } = req.body;
    const { imageUrl, uploadedImageCount } = resolveImageInfo(req);

    if (!name || String(name).trim().length < 2) throw new Error('Nome é obrigatório');
    if (!description || String(description).trim().length < 2) throw new Error('Descrição é obrigatória');
    if (Number.isNaN(Number(price)) || Number(price) < 0) throw new Error('Preço inválido');
    if (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < -1)) throw new Error('Estoque inválido');
    if (!imageUrl && uploadedImageCount === 0) throw new Error('Imagem do produto é obrigatória');

    return true;
  }),
];

const productUpdateValidator = [
  body().custom((value, { req }) => {
    const numericFields = ['price', 'stock'];
    for (const field of numericFields) {
      if (req.body[field] !== undefined && Number.isNaN(Number(req.body[field]))) {
        throw new Error(`Campo numérico inválido: ${field}`);
      }
    }
    return true;
  }),
];

module.exports = {
  productCreateValidator,
  productUpdateValidator,
};
