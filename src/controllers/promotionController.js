const dayjs = require('dayjs');
const Promotion = require('../models/Promotion');
const { logAdminAction } = require('../services/auditService');

const hasConflict = async (payload, currentId) => {
  const query = {
    ativa: true,
    dataInicio: { $lte: new Date(payload.dataFim) },
    dataFim: { $gte: new Date(payload.dataInicio) },
    aplicavelEm: payload.aplicavelEm,
  };

  if (payload.aplicavelEm === 'produto') query.produto = payload.produto;
  if (payload.aplicavelEm === 'categoria') query.categoria = payload.categoria;
  if (currentId) query._id = { $ne: currentId };

  return Promotion.exists(query);
};

const createPromotion = async (req, res, next) => {
  try {
    if (dayjs(req.body.dataFim).isBefore(dayjs())) {
      return res.status(400).json({ message: 'Não permitir promoções expiradas' });
    }
    if (await hasConflict(req.body)) {
      return res.status(409).json({ message: 'Promoção conflitante no mesmo período' });
    }
    const promotion = await Promotion.create({ ...req.body, criadoPor: req.user._id });
    await logAdminAction({ req, action: 'create', resource: 'promotion', resourceId: promotion._id, payload: req.body });
    return res.status(201).json(promotion);
  } catch (error) {
    return next(error);
  }
};

const updatePromotion = async (req, res, next) => {
  try {
    if (dayjs(req.body.dataFim).isBefore(dayjs())) {
      return res.status(400).json({ message: 'Não permitir promoções expiradas' });
    }
    if (await hasConflict(req.body, req.params.id)) {
      return res.status(409).json({ message: 'Promoção conflitante no mesmo período' });
    }
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
    const promotions = await Promotion.find().sort({ criadoEm: -1 });
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
