const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('../utils/slugify');
const { calculateFinalPrice } = require('../services/promotionService');
const { logAdminAction } = require('../services/auditService');

const asNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const serializeProduct = (productDoc) => {
  const product = productDoc.toObject ? productDoc.toObject() : productDoc;
  const pricing = calculateFinalPrice(product);
  const preco = asNumber(product.preco, 0);
  const precoPromocional = product.precoPromocional === undefined ? null : asNumber(product.precoPromocional, null);

  return {
    ...product,
    ...pricing,
    estoqueInfinito: Number(product.stock ?? product.estoque) === -1 || product.stock === null || product.estoque === null,
    estoqueBaixo: Number(product.stock ?? product.estoque) !== -1 && asNumber(product.estoque, 0) <= 5,
    // aliases para compatibilidade com frontend
    price: preco,
    finalPrice: asNumber(pricing.precoFinal, 0),
    promoPrice: precoPromocional,
    imageUrl: product.imageUrl || product.images?.[0] || product.imagens?.[0] || '',
  };
};

const normalizeProductPayload = (body = {}) => ({
  nome: body.nome || body.name,
  descricao: body.descricao || body.shortDescription || body.description,
  descricaoDetalhada: body.descricaoDetalhada || body.longDescription || body.richDescription,
  preco: Number(body.preco ?? body.price),
  precoPromocional: body.precoPromocional !== undefined ? Number(body.precoPromocional) : undefined,
  cost: body.cost !== undefined ? Number(body.cost) : undefined,
  estoque: Number(body.estoque ?? body.stock),
  sku: body.sku,
  marca: body.marca || body.brand,
  peso: body.peso !== undefined ? Number(body.peso) : undefined,
  dimensoes: body.dimensoes,
  categoria: body.categoria || body.category || body.categoryId,
  categoryId: body.categoryId || body.categoria || body.category,
  imageUrl: body.imageUrl || body.image || body.imagem,
  subcategoria: body.subcategoria || body.subcategory || body.subcategoryId,
  variacoes: body.variacoes || body.variations,
  destaque: body.destaque ?? body.featured,
  ativo: body.ativo,
  promocao: body.promocao,
});

const canManageProduct = (user, product) => user.role === 'admin' || String(product.criadoPor) === String(user._id);

const createProduct = async (req, res, next) => {
  try {
    const imagePaths = (req.files || []).map((file) => `/uploads/${file.filename}`);
    const normalized = normalizeProductPayload(req.body);

    normalized.preco = Number(normalized.preco);
    normalized.cost = Number(normalized.cost ?? 0);
    normalized.estoque = Number(normalized.estoque);
    if ([normalized.preco, normalized.cost, normalized.estoque].some((n) => Number.isNaN(n))) {
      return res.status(400).json({ message: 'Campos numéricos inválidos (preço/custo/estoque)' });
    }

    const imageUrl = normalized.imageUrl || imagePaths[0];
    if (!imageUrl) return res.status(400).json({ message: 'imageUrl ou upload de imagem é obrigatório' });

    const product = await Product.create({
      ...normalized,
      slug: slugify(normalized.nome),
      imagens: imagePaths,
      images: imagePaths,
      imageUrl,
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

    if (payload.preco !== undefined) payload.preco = Number(payload.preco);
    if (payload.cost !== undefined) payload.cost = Number(payload.cost);
    if (payload.estoque !== undefined) payload.estoque = Number(payload.estoque);
    if ([payload.preco, payload.cost, payload.estoque].some((n) => n !== undefined && Number.isNaN(n))) {
      return res.status(400).json({ message: 'Campos numéricos inválidos (preço/custo/estoque)' });
    }

    if (payload.nome) payload.slug = slugify(payload.nome);
    if (req.files?.length) {
      payload.imagens = req.files.map((file) => `/uploads/${file.filename}`);
      payload.images = payload.imagens;
      if (!payload.imageUrl) payload.imageUrl = payload.imagens[0];
    }

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

    return res.json(serializeProduct(product));
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
      const categories = await Category.find({ nome: { $regex: resolvedSearch, $options: 'i' } }).select('_id');
      const categoryIds = categories.map((c) => c._id);
      filter.$or = [
        { nome: { $regex: resolvedSearch, $options: 'i' } },
        { descricao: { $regex: resolvedSearch, $options: 'i' } },
        { categoria: { $in: categoryIds } },
      ];
    }

    const sortMap = {
      precoAsc: { preco: 1 },
      precoDesc: { preco: -1 },
      maisRecentes: { criadoEm: -1 },
      maisVendidos: { soldCount: -1 },
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

    const productsWithFinalPrice = products.map((p) => serializeProduct(p));

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
