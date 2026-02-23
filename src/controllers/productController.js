/**
 * Controller: recebe requisições HTTP, valida entradas básicas e delega regras aos serviços/modelos.
 * Arquivo: src/controllers/productController.js
 */
const Product = require('../models/Product');
const { getActivePromotionsMap, toProductResponse } = require('../services/pricingService');
const { ok, fail } = require('../utils/apiResponse');

// Normaliza múltiplas variações de payload vindas de diferentes clientes/frontend.
const normalizeProductPayload = (body = {}) => ({
  name: body.name,
  description: body.description,
  imageUrl: body.imageUrl || body.image,
  price: body.price,
  stock: body.stock,
});

const createProduct = async (req, res, next) => {
  try {
    // Quando houver upload multipart, convertemos os arquivos enviados para caminhos públicos.
    const imagePaths = (req.files || []).map((file) => `/uploads/${file.filename}`);
    const payload = normalizeProductPayload(req.body);

    // Prioriza imageUrl explícita; caso não exista, usa a primeira imagem enviada no upload.
    if (!payload.imageUrl) payload.imageUrl = imagePaths[0];
    if (!payload.imageUrl || typeof payload.imageUrl !== 'string') {
      return fail(res, 'imageUrl é obrigatório', 400);
    }

    payload.price = Number(payload.price);
    payload.stock = payload.stock === undefined ? -1 : Number(payload.stock);

    if (!payload.name || !payload.description || Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
      return fail(res, 'Campos obrigatórios inválidos', 400);
    }

    // O preço final com promoção é sempre calculado dinamicamente no retorno.
    const product = await Product.create(payload);
    return ok(res, toProductResponse(product, null), 201);
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const payload = normalizeProductPayload(req.body);
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    if (req.files?.length && !payload.imageUrl) {
      payload.imageUrl = `/uploads/${req.files[0].filename}`;
    }

    if (payload.imageUrl !== undefined && (typeof payload.imageUrl !== 'string' || !payload.imageUrl.trim())) {
      return fail(res, 'imageUrl inválida', 400);
    }

    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.stock !== undefined) payload.stock = Number(payload.stock);

    if ([payload.price, payload.stock].some((value) => value !== undefined && Number.isNaN(value))) {
      return fail(res, 'Campos numéricos inválidos', 400);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!product) return fail(res, 'Produto não encontrado', 404);

    const promotionsMap = await getActivePromotionsMap([product._id]);
    return ok(res, toProductResponse(product, promotionsMap.get(String(product._id))));
  } catch (error) {
    return next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return fail(res, 'Produto não encontrado', 404);

    const promotionsMap = await getActivePromotionsMap([product._id]);
    return ok(res, toProductResponse(product, promotionsMap.get(String(product._id))));
  } catch (error) {
    return next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { search, sort = 'maisVendidos', page = 1, limit = 10 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = {
      precoAsc: { price: 1 },
      precoDesc: { price: -1 },
      maisRecentes: { createdAt: -1 },
      maisVendidos: { soldCount: -1 },
    };

    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.max(Number(limit), 1);

    // Faz contagem e listagem em paralelo para reduzir latência da rota.
    const [totalItems, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sortMap[sort] || sortMap.maisVendidos)
        .skip((currentPage - 1) * perPage)
        .limit(perPage),
    ]);

    // Busca promoções ativas de uma vez para evitar N+1 queries.
    const productIds = products.map((product) => product._id);
    const promotionsMap = await getActivePromotionsMap(productIds);

    const payload = {
      totalItems,
      totalPages: Math.ceil(totalItems / perPage),
      currentPage,
      products: products.map((product) => toProductResponse(product, promotionsMap.get(String(product._id)))),
    };

    return ok(res, payload);
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return fail(res, 'Produto não encontrado', 404);
    return ok(res, { message: 'Produto removido com sucesso' });
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
