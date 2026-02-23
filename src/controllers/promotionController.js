/**
 * Controller: recebe requisições HTTP, valida entradas básicas e delega regras aos serviços/modelos.
 * Arquivo: src/controllers/promotionController.js
 */
const Promotion = require('../models/Promotion');
const Product = require('../models/Product');
const { ok, fail } = require('../utils/apiResponse');

// Normaliza valores vindos do front para tipos esperados pelo schema.
const normalizePayload = (body = {}) => {
  const payload = {};

  if (body.productId !== undefined) payload.productId = body.productId;
  if (body.discountPercentage !== undefined) payload.discountPercentage = Number(body.discountPercentage);
  if (body.startDate !== undefined) payload.startDate = body.startDate ? new Date(body.startDate) : null;
  if (body.endDate !== undefined) payload.endDate = body.endDate ? new Date(body.endDate) : null;
  if (body.active !== undefined) payload.active = body.active;

  return payload;
};

const validatePromotion = (payload, { partial = false } = {}) => {
  if (!partial || payload.productId !== undefined) {
    if (!payload.productId) return 'Produto é obrigatório';
  }

  if (!partial || payload.discountPercentage !== undefined) {
    if (
      Number.isNaN(payload.discountPercentage)
      || payload.discountPercentage < 1
      || payload.discountPercentage > 100
    ) {
      return 'Desconto deve estar entre 1 e 100';
    }
  }

  if (!partial || payload.startDate !== undefined) {
    if (!payload.startDate || Number.isNaN(payload.startDate.getTime())) return 'startDate inválido';
  }

  if (!partial || payload.endDate !== undefined) {
    if (!payload.endDate || Number.isNaN(payload.endDate.getTime())) return 'endDate inválido';
  }

  if (payload.startDate && payload.endDate && payload.endDate < payload.startDate) {
    return 'endDate deve ser maior que startDate';
  }

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
    const existingPromotion = await Promotion.findById(req.params.id);
    if (!existingPromotion) return fail(res, 'Promoção não encontrada', 404);

    const updates = normalizePayload(req.body);
    const mergedPayload = {
      productId: updates.productId !== undefined ? updates.productId : existingPromotion.productId,
      discountPercentage: updates.discountPercentage !== undefined ? updates.discountPercentage : existingPromotion.discountPercentage,
      startDate: updates.startDate !== undefined ? updates.startDate : existingPromotion.startDate,
      endDate: updates.endDate !== undefined ? updates.endDate : existingPromotion.endDate,
      active: updates.active !== undefined ? updates.active : existingPromotion.active,
    };

    const validationError = validatePromotion(mergedPayload);
    if (validationError) return fail(res, validationError, 400);

    const product = await Product.findById(mergedPayload.productId);
    if (!product) return fail(res, 'Produto não encontrado', 404);

    const promotion = await Promotion.findByIdAndUpdate(req.params.id, mergedPayload, { new: true, runValidators: true });
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
