const dayjs = require('dayjs');
const Promotion = require('../models/Promotion');
const Product = require('../models/Product');
const { logAdminAction } = require('../services/auditService');

const toBoolean = (value, fallback = true) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
};

const normalizePayload = (body = {}) => ({
  title: body.title || body.nome,
  discountPercentage: Number(body.discountPercentage ?? body.valor),
  productId: body.productId || body.produto,
  startDate: new Date(body.startDate || body.dataInicio),
  endDate: new Date(body.endDate || body.dataFim),
  active: toBoolean(body.active ?? body.ativa, true),
});

const hasConflict = async (payload, currentId) => {
  const query = {
    active: true,
    productId: payload.productId,
    startDate: { $lte: payload.endDate },
    endDate: { $gte: payload.startDate },
  };

  if (currentId) query._id = { $ne: currentId };
  return Promotion.exists(query);
};

const validatePromotion = (payload) => {
  if (!payload.title || !payload.productId) return 'Título e produto são obrigatórios';
  if (Number.isNaN(payload.discountPercentage) || payload.discountPercentage < 1 || payload.discountPercentage > 100) {
    return 'Desconto deve estar entre 1 e 100';
  }
  if (Number.isNaN(payload.startDate.getTime()) || Number.isNaN(payload.endDate.getTime())) {
    return 'Datas inválidas';
  }
  if (dayjs(payload.endDate).isBefore(dayjs(payload.startDate))) return 'Data final deve ser maior que data inicial';
  if (dayjs(payload.endDate).isBefore(dayjs())) return 'Não permitir promoções expiradas';
  return null;
};

const syncProductPromotion = async (promotion, clear = false) => {
  if (!promotion?.productId) return;
  if (clear) {
    await Product.findByIdAndUpdate(promotion.productId, {
      promocao: { ativa: false, tipo: 'percentual', valor: 0, dataInicio: null, dataFim: null },
    });
    return;
  }

  await Product.findByIdAndUpdate(promotion.productId, {
    promocao: {
      ativa: promotion.active,
      tipo: 'percentual',
      valor: promotion.discountPercentage,
      dataInicio: promotion.startDate,
      dataFim: promotion.endDate,
    },
  });
};

const createPromotion = async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);
    const validationError = validatePromotion(payload);
    if (validationError) return res.status(400).json({ message: validationError });

    const product = await Product.findById(payload.productId);
    if (!product) return res.status(404).json({ message: 'Produto não encontrado para promoção' });

    if (await hasConflict(payload)) {
      return res.status(409).json({ message: 'Promoção conflitante no mesmo período para este produto' });
    }

    const promotion = await Promotion.create({ ...payload, criadoPor: req.user._id });
    await syncProductPromotion(promotion);

    await logAdminAction({ req, action: 'create', resource: 'promotion', resourceId: promotion._id, payload: req.body });
    return res.status(201).json(promotion);
  } catch (error) {
    return next(error);
  }
};

const updatePromotion = async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);
    const validationError = validatePromotion(payload);
    if (validationError) return res.status(400).json({ message: validationError });

    const product = await Product.findById(payload.productId);
    if (!product) return res.status(404).json({ message: 'Produto não encontrado para promoção' });

    if (await hasConflict(payload, req.params.id)) {
      return res.status(409).json({ message: 'Promoção conflitante no mesmo período para este produto' });
    }

    const promotion = await Promotion.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!promotion) return res.status(404).json({ message: 'Promoção não encontrada' });

    await syncProductPromotion(promotion);
    await logAdminAction({ req, action: 'update', resource: 'promotion', resourceId: promotion._id, payload: req.body });
    return res.json(promotion);
  } catch (error) {
    return next(error);
  }
};

const deletePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) return res.status(404).json({ message: 'Promoção não encontrada' });

    await syncProductPromotion(promotion, true);
    await logAdminAction({ req, action: 'delete', resource: 'promotion', resourceId: req.params.id });
    return res.json({ message: 'Promoção removida' });
  } catch (error) {
    return next(error);
  }
};

const getPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 }).populate('productId', 'nome imageUrl');
    return res.json(promotions);
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
