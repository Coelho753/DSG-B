const Category = require('../models/Category');
const slugify = require('../utils/slugify');

const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create({
      nome: req.body.nome,
      slug: slugify(req.body.nome),
      ativo: req.body.ativo,
      criadaPor: req.user._id,
    });
    return res.status(201).json(category);
  } catch (error) {
    return next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ criadaEm: -1 });
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
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
    return res.json(category);
  } catch (error) {
    return next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
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
