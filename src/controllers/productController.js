const Product = require('../models/Product');
const slugify = require('../utils/slugify');
const { calculateFinalPrice } = require('../services/promotionService');
const { logAdminAction } = require('../services/auditService');

const normalizeProductPayload = (body = {}) => ({
  nome: body.nome || body.name,
  descricao: body.descricao || body.shortDescription || body.description,
  descricaoDetalhada: body.descricaoDetalhada || body.longDescription || body.richDescription,
  preco: Number(body.preco ?? body.price),
  precoPromocional: body.precoPromocional !== undefined ? Number(body.precoPromocional) : undefined,
  estoque: Number(body.estoque ?? body.stock),
  sku: body.sku,
  marca: body.marca || body.brand,
  peso: body.peso !== undefined ? Number(body.peso) : undefined,
  dimensoes: body.dimensoes,
  categoria: body.categoria || body.category || body.categoryId,
  subcategoria: body.subcategoria || body.subcategory || body.subcategoryId,
  variacoes: body.variacoes || body.variations,
  destaque: body.destaque ?? body.featured,
  ativo: body.ativo,
  promocao: body.promocao,
});

const canManageProduct = (user, product) => user.role === 'admin' || String(product.criadoPor) === String(user._id);

const createProduct = async (req, res, next) => {
  try {
    const imagePaths = (req.files || []).map((file) => file.path);
    const normalized = normalizeProductPayload(req.body);

    const product = await Product.create({
      ...normalized,
      slug: slugify(normalized.nome),
      imagens: imagePaths,
      criadoPor: req.user._id,
    });

    await logAdminAction({ req, action: 'create', resource: 'product', resourceId: product._id, payload: req.body });
    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const productExists = await Product.findById(req.params.id);
    if (!productExists) return res.status(404).json({ message: 'Produto não encontrado' });
    if (!canManageProduct(req.user, productExists)) return res.status(403).json({ message: 'Sem permissão para editar este produto' });

    const payload = normalizeProductPayload(req.body);
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    if (payload.nome) payload.slug = slugify(payload.nome);
    if (req.files?.length) payload.imagens = req.files.map((file) => file.path);

    const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });

    await logAdminAction({ req, action: 'update', resource: 'product', resourceId: product._id, payload: req.body });
    return res.json(product);
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoria subcategoria criadoPor', 'nome email');
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });

    const pricing = calculateFinalPrice(product);
    return res.json({ ...product.toObject(), ...pricing, estoqueBaixo: product.estoque <= 5 });
  } catch (error) {
    return next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const {
      categoria,
      category,
      categoryId,
      status,
      precoMin,
      minPrice,
      precoMax,
      maxPrice,
      busca,
      search,
      ordenacao = 'maisRecentes',
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (status === 'ativo') filter.ativo = true;
    else if (status === 'inativo') filter.ativo = false;

    if (req.user && req.user.role === 'seller') filter.criadoPor = req.user._id;

    const resolvedCategory = categoria || category || categoryId;
    const resolvedSearch = busca || search;
    const resolvedMinPrice = precoMin ?? minPrice;
    const resolvedMaxPrice = precoMax ?? maxPrice;
    const resolvedSort = sort || ordenacao;

    if (resolvedCategory) filter.categoria = resolvedCategory;
    if (resolvedMinPrice || resolvedMaxPrice) {
      filter.preco = {};
      if (resolvedMinPrice) filter.preco.$gte = Number(resolvedMinPrice);
      if (resolvedMaxPrice) filter.preco.$lte = Number(resolvedMaxPrice);
    }
    if (resolvedSearch) {
      filter.$or = [
        { nome: { $regex: resolvedSearch, $options: 'i' } },
        { descricao: { $regex: resolvedSearch, $options: 'i' } },
      ];
    }

    const sortMap = {
      precoAsc: { preco: 1 },
      precoDesc: { preco: -1 },
      maisRecentes: { criadoEm: -1 },
      maisVendidos: { totalVendido: -1 },
      dataAsc: { criadoEm: 1 },
      dataDesc: { criadoEm: -1 },
    };

    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.max(Number(limit), 1);

    const [totalItems, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .populate('categoria subcategoria', 'nome slug')
        .sort(sortMap[resolvedSort] || sortMap.maisRecentes)
        .skip((currentPage - 1) * perPage)
        .limit(perPage),
    ]);

    const productsWithFinalPrice = products.map((p) => ({
      ...p.toObject(),
      ...calculateFinalPrice(p),
      estoqueBaixo: p.estoque <= 5,
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
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
    if (!canManageProduct(req.user, product)) return res.status(403).json({ message: 'Sem permissão para excluir este produto' });

    await Product.findByIdAndDelete(req.params.id);
    await logAdminAction({ req, action: 'delete', resource: 'product', resourceId: req.params.id });
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
