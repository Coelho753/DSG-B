const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { calculateFinalPrice } = require('../services/promotionService');

const ensureCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
};

const calcTotals = (items = []) => {
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  return { subtotal: Number(subtotal.toFixed(2)), total: Number(subtotal.toFixed(2)) };
};

const getCart = async (req, res, next) => {
  try {
    const cart = await ensureCart(req.user._id);
    const populated = await Cart.findById(cart._id).populate('items.productId', 'nome preco imagens estoque');
    return res.json({ ...populated.toObject(), ...calcTotals(populated.items) });
  } catch (error) {
    return next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    const quantity = Math.max(Number(req.body.quantity || 1), 1);

    const product = await Product.findById(productId);
    if (!product || !product.ativo) return res.status(404).json({ message: 'Produto não encontrado' });

    const cart = await ensureCart(req.user._id);
    const pricing = calculateFinalPrice(product);

    const existing = cart.items.find((i) => String(i.productId) === String(productId));
    if (existing) {
      existing.quantity += quantity;
      existing.unitPrice = pricing.precoFinal;
    } else {
      cart.items.push({ productId, quantity, unitPrice: pricing.precoFinal });
    }

    cart.updatedAt = new Date();
    await cart.save();

    const populated = await Cart.findById(cart._id).populate('items.productId', 'nome preco imagens estoque');
    return res.status(201).json({ ...populated.toObject(), ...calcTotals(populated.items) });
  } catch (error) {
    return next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    const quantity = Number(req.body.quantity);
    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'productId e quantity >=1 são obrigatórios' });
    }

    const cart = await ensureCart(req.user._id);
    const item = cart.items.find((i) => String(i.productId) === String(productId));
    if (!item) return res.status(404).json({ message: 'Item não encontrado no carrinho' });
    item.quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();

    const populated = await Cart.findById(cart._id).populate('items.productId', 'nome preco imagens estoque');
    return res.json({ ...populated.toObject(), ...calcTotals(populated.items) });
  } catch (error) {
    return next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const productId = req.body.productId || req.query.productId;
    const cart = await ensureCart(req.user._id);
    cart.items = cart.items.filter((i) => String(i.productId) !== String(productId));
    cart.updatedAt = new Date();
    await cart.save();

    const populated = await Cart.findById(cart._id).populate('items.productId', 'nome preco imagens estoque');
    return res.json({ ...populated.toObject(), ...calcTotals(populated.items) });
  } catch (error) {
    return next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await ensureCart(req.user._id);
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();
    return res.json({ ...cart.toObject(), subtotal: 0, total: 0 });
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
};
