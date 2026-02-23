/**
 * Controller: recebe requisições HTTP, valida entradas básicas e delega regras aos serviços/modelos.
 * Arquivo: src/controllers/promotionController.js
 */
const Promotion = require('../models/Promotion');
const Product = require('../models/Product');
const { ok, fail } = require('../utils/apiResponse');

const normalizePayload = (body = {}) => ({
  productId: body.productId,
  discountPercentage: Number(body.discountPercentage),
  startDate: body.startDate ? new Date(body.startDate) : null,
  endDate: body.endDate ? new Date(body.endDate) : null,
  active: body.active === undefined ? true : body.active,
});

const validatePromotion = (payload) => {
  if (!payload.productId) return 'Produto é obrigatório';
  if (Number.isNaN(payload.discountPercentage) || payload.discountPercentage < 1 || payload.discountPercentage > 100) {
    return 'Desconto deve estar entre 1 e 100';
  }
  if (!payload.startDate || Number.isNaN(payload.startDate.getTime())) return 'startDate inválido';
  if (!payload.endDate || Number.isNaN(payload.endDate.getTime())) return 'endDate inválido';
  if (payload.endDate < payload.startDate) return 'endDate deve ser maior que startDate';
  return null;
};

const createPromotion = async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);
    const validationError = validatePromotion(payload);
    if (validationError) return fail(res, validationError, 400);

    const product = await Product.findById(payload.productId);
    if (!product) return fail(res, 'Produto não encontrado', 404);

    const promotion = await Promotion.create(payload);
    return ok(res, promotion, 201);
  } catch (error) {
    return next(error);
  }
};

const updatePromotion = async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);
    const validationError = validatePromotion(payload);
    if (validationError) return fail(res, validationError, 400);

    const product = await Product.findById(payload.productId);
    if (!product) return fail(res, 'Produto não encontrado', 404);

    const promotion = await Promotion.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!promotion) return fail(res, 'Promoção não encontrada', 404);

    return ok(res, promotion);
  } catch (error) {
    return next(error);
  }
};

const deletePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) return fail(res, 'Promoção não encontrada', 404);
    return ok(res, { message: 'Promoção removida' });
  } catch (error) {
    return next(error);
  }
};

const getPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 }).populate('productId', 'name imageUrl');
    return ok(res, promotions);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotions,
};
