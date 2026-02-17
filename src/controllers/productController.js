const Product = require('../models/Product');
const slugify = require('../utils/slugify');
const { calculateFinalPrice } = require('../services/promotionService');

const createProduct = async (req, res, next) => {
  try {
    const imagePaths = (req.files || []).map((file) => file.path);
    const product = await Product.create({
      ...req.body,
      slug: slugify(req.body.nome),
      imagens: imagePaths,
      criadoPor: req.user._id,
    });

    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.nome) payload.slug = slugify(payload.nome);
    if (req.files?.length) payload.imagens = req.files.map((file) => file.path);

    const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });

    return res.json(product);
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoria criadoPor', 'nome email');
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });

    const pricing = calculateFinalPrice(product);
    return res.json({ ...product.toObject(), ...pricing });
  } catch (error) {
    return next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const {
      categoria,
      precoMin,
      precoMax,
      busca,
      ordenacao = 'maisRecentes',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { ativo: true };

    if (categoria) filter.categoria = categoria;
    if (precoMin || precoMax) {
      filter.preco = {};
      if (precoMin) filter.preco.$gte = Number(precoMin);
      if (precoMax) filter.preco.$lte = Number(precoMax);
    }
    if (busca) {
      filter.$or = [
        { nome: { $regex: busca, $options: 'i' } },
        { descricao: { $regex: busca, $options: 'i' } },
      ];
    }

    const sortMap = {
      precoAsc: { preco: 1 },
      precoDesc: { preco: -1 },
      maisRecentes: { criadoEm: -1 },
      maisVendidos: { totalVendido: -1 },
    };

    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.max(Number(limit), 1);

    const [totalItems, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .populate('categoria', 'nome slug')
        .sort(sortMap[ordenacao] || sortMap.maisRecentes)
        .skip((currentPage - 1) * perPage)
        .limit(perPage),
    ]);

    const productsWithFinalPrice = products.map((p) => ({
      ...p.toObject(),
      ...calculateFinalPrice(p),
    }));

    return res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / perPage),
      currentPage,
      products: productsWithFinalPrice,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
    return res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getProductById,
  getProducts,
  deleteProduct,
};
