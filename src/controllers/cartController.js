/**
 * Controller: recebe requisições HTTP, valida entradas básicas e delega regras aos serviços/modelos.
 * Arquivo: src/controllers/cartController.js
 */
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { calculateFinalPrice } = require('../services/promotionService');

const ABANDONED_MINUTES = 30;

const ensureCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
};

const calcTotals = (items = []) => {
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  return { subtotal: Number(subtotal.toFixed(2)), total: Number(subtotal.toFixed(2)) };
};

const markAbandonedIfNeeded = async (cart) => {
  if (!cart.items?.length) return cart;
  const diffMs = Date.now() - new Date(cart.updatedAt).getTime();
  const isAbandoned = diffMs >= ABANDONED_MINUTES * 60 * 1000;
  if (isAbandoned && !cart.isAbandoned) {
    cart.isAbandoned = true;
    cart.abandonedAt = new Date();
    await cart.save();
  }
  return cart;
};

const setCartAsActive = (cart) => {
  cart.isAbandoned = false;
  cart.abandonedAt = null;
  cart.updatedAt = new Date();
};

const getCart = async (req, res, next) => {
  try {
    const cart = await ensureCart(req.user._id);
    await markAbandonedIfNeeded(cart);
    const populated = await Cart.findById(cart._id).populate('items.productId', 'name price imageUrl stock');
    return res.json({ ...populated.toObject(), ...calcTotals(populated.items) });
  } catch (error) {
    return next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const productId = req.body.productId || req.body.id || req.body.product || req.body.product_id;
    const quantity = Math.max(Number(req.body.quantity || req.body.qty || 1), 1);

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });

    const stock = Number(product.stock);
    const infiniteStock = stock === -1;

    const cart = await ensureCart(req.user._id);
    const existing = cart.items.find((i) => String(i.productId) === String(productId));
    const nextQuantity = (existing?.quantity || 0) + quantity;

    if (!infiniteStock && stock >= 0 && nextQuantity > stock) {
      return res.status(400).json({ message: 'Estoque insuficiente para este produto' });
    }

    const pricing = calculateFinalPrice(product);

    if (existing) {
      existing.quantity = nextQuantity;
      existing.unitPrice = pricing.precoFinal;
    } else {
      cart.items.push({ productId, quantity, unitPrice: pricing.precoFinal });
    }

    setCartAsActive(cart);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate('items.productId', 'name price imageUrl stock');
    return res.status(201).json({ ...populated.toObject(), ...calcTotals(populated.items) });
  } catch (error) {
    return next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const productId = req.body.productId || req.body.id || req.body.product || req.body.product_id;
    const quantity = Number(req.body.quantity ?? req.body.qty);
    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'productId e quantity >=1 são obrigatórios' });
    }

    const cart = await ensureCart(req.user._id);
    const item = cart.items.find((i) => String(i.productId) === String(productId));
    if (!item) return res.status(404).json({ message: 'Item não encontrado no carrinho' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
    const stock = Number(product.stock);
    const infiniteStock = stock === -1;
    if (!infiniteStock && stock >= 0 && quantity > stock) {
      return res.status(400).json({ message: 'Estoque insuficiente para este produto' });
    }

    item.quantity = quantity;
    setCartAsActive(cart);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate('items.productId', 'name price imageUrl stock');
    return res.json({ ...populated.toObject(), ...calcTotals(populated.items) });
  } catch (error) {
    return next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const productId = req.body.productId || req.query.productId || req.body.id || req.query.id || req.body.product || req.query.product;
    const cart = await ensureCart(req.user._id);
    cart.items = cart.items.filter((i) => String(i.productId) !== String(productId));
    setCartAsActive(cart);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate('items.productId', 'name price imageUrl stock');
    return res.json({ ...populated.toObject(), ...calcTotals(populated.items) });
  } catch (error) {
    return next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await ensureCart(req.user._id);
    cart.items = [];
    setCartAsActive(cart);
    await cart.save();
    return res.json({ ...cart.toObject(), subtotal: 0, total: 0 });
  } catch (error) {
    return next(error);
  }
};

const getAbandonedCarts = async (req, res, next) => {
  try {
    const carts = await Cart.find({ isAbandoned: true, items: { $exists: true, $ne: [] } })
      .populate('userId', 'name email')
      .populate('items.productId', 'name price imageUrl');

    const payload = carts.map((cart) => {
      const totals = calcTotals(cart.items);
      return {
        id: cart._id,
        user: cart.userId,
        itens: cart.items,
        total: totals.total,
        tempoAbandonadoMinutos: cart.abandonedAt ? Math.floor((Date.now() - new Date(cart.abandonedAt).getTime()) / 60000) : 0,
      };
    });

    return res.json(payload);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getAbandonedCarts,
};
