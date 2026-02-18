const Category = require('../models/Category');
const slugify = require('../utils/slugify');
const { logAdminAction } = require('../services/auditService');

const normalizeCategoryPayload = (body = {}) => {
  const statusRaw = body.status;
  const statusAsAtivo =
    statusRaw === undefined
      ? undefined
      : ['ativo', 'active', true, 'true', 1, '1'].includes(statusRaw);

  return {
    nome: body.nome || body.name,
    parent: body.parent || body.parentId || null,
    icone: body.icone || body.icon,
    ordemExibicao: body.ordemExibicao ?? body.displayOrder,
    ativo: body.ativo ?? statusAsAtivo,
  };
};

const createCategory = async (req, res, next) => {
  try {
    const normalized = normalizeCategoryPayload(req.body);

    const category = await Category.create({
      ...normalized,
      slug: slugify(normalized.nome),
      criadaPor: req.user._id,
    });
    await logAdminAction({ req, action: 'create', resource: 'category', resourceId: category._id, payload: req.body });
    return res.status(201).json(category);
  } catch (error) {
    return next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status === 'ativo' || req.query.status === 'active') filter.ativo = true;
    if (req.query.status === 'inativo' || req.query.status === 'inactive') filter.ativo = false;

    const categories = await Category.find(filter)
      .populate('parent', 'nome slug')
      .sort({ ordemExibicao: 1, criadaEm: -1 });
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent', 'nome slug');
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
    return res.json(category);
  } catch (error) {
    return next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const normalized = normalizeCategoryPayload(req.body);
    const payload = { ...normalized };
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    if (payload.nome) payload.slug = slugify(payload.nome);

    const category = await Category.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
    await logAdminAction({ req, action: 'update', resource: 'category', resourceId: category._id, payload: req.body });
    return res.json(category);
  } catch (error) {
    return next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
    await logAdminAction({ req, action: 'delete', resource: 'category', resourceId: req.params.id });
    return res.json({ message: 'Categoria removida com sucesso' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
