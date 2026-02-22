const dayjs = require('dayjs');
const Promotion = require('../models/Promotion');
const { logAdminAction } = require('../services/auditService');

const normalizePayload = (body = {}) => ({
  title: body.title || body.nome,
  discountPercentage: Number(body.discountPercentage ?? body.valor),
  productId: body.productId || body.produto,
  startDate: body.startDate || body.dataInicio,
  endDate: body.endDate || body.dataFim,
  active: body.active ?? body.ativa ?? true,
});

const hasConflict = async (payload, currentId) => {
  const query = {
    active: true,
    productId: payload.productId,
    startDate: { $lte: new Date(payload.endDate) },
    endDate: { $gte: new Date(payload.startDate) },
  };

  if (currentId) query._id = { $ne: currentId };
  return Promotion.exists(query);
};

const validatePromotion = (payload) => {
  if (!payload.title || !payload.productId) return 'Título e produto são obrigatórios';
  if (Number.isNaN(payload.discountPercentage) || payload.discountPercentage < 1 || payload.discountPercentage > 100) {
    return 'Desconto deve estar entre 1 e 100';
  }
  if (dayjs(payload.endDate).isBefore(dayjs(payload.startDate))) return 'Data final deve ser maior que data inicial';
  if (dayjs(payload.endDate).isBefore(dayjs())) return 'Não permitir promoções expiradas';
  return null;
};

const createPromotion = async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);
    const validationError = validatePromotion(payload);
    if (validationError) return res.status(400).json({ message: validationError });

    if (await hasConflict(payload)) {
      return res.status(409).json({ message: 'Promoção conflitante no mesmo período para este produto' });
    }

    const promotion = await Promotion.create({ ...payload, criadoPor: req.user._id });
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

    if (await hasConflict(payload, req.params.id)) {
      return res.status(409).json({ message: 'Promoção conflitante no mesmo período para este produto' });
    }

    const promotion = await Promotion.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!promotion) return res.status(404).json({ message: 'Promoção não encontrada' });
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
