const Category = require('../models/Category');
const slugify = require('../utils/slugify');
const { logAdminAction } = require('../services/auditService');

const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create({
      nome: req.body.nome,
      slug: slugify(req.body.nome),
      parent: req.body.parent || null,
      icone: req.body.icone,
      ordemExibicao: req.body.ordemExibicao,
      ativo: req.body.ativo,
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
    const categories = await Category.find().populate('parent', 'nome slug').sort({ ordemExibicao: 1, criadaEm: -1 });
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
    const payload = { ...req.body };
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
