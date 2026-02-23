/**
 * Controller: recebe requisições HTTP, valida entradas básicas e delega regras aos serviços/modelos.
 * Arquivo: src/controllers/orderController.js
 */
const Order = require('../models/Order');
const Product = require('../models/Product');
const { calculateShipping } = require('../services/shippingService');
const { getActivePromotionsMap, toProductResponse } = require('../services/pricingService');
const { ok, fail } = require('../utils/apiResponse');

const createOrder = async (req, res, next) => {
  try {
    const items = req.body.items || req.body.produtos || [];
    if (!Array.isArray(items) || !items.length) return fail(res, 'Itens obrigatórios', 400);

    const productIds = items.map((item) => item.productId || item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [String(product._id), product]));
    const promotionsMap = await getActivePromotionsMap(productIds);

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const productId = String(item.productId || item.product);
      const quantity = Number(item.quantity || item.quantidade || 0);
      const product = productMap.get(productId);

      if (!product || quantity <= 0) return fail(res, `Item inválido: ${productId}`, 400);

      if (product.stock !== -1 && product.stock < quantity) {
        return fail(res, `Estoque insuficiente para ${product.name}`, 400);
      }

      const responseProduct = toProductResponse(product, promotionsMap.get(productId));
      const itemSubtotal = Number((responseProduct.finalPrice * quantity).toFixed(2));
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity,
        unitPrice: responseProduct.finalPrice,
        subtotal: itemSubtotal,
      });

      if (product.stock !== -1) product.stock -= quantity;
      product.soldCount += quantity;
      await product.save();
    }

    const shipping = calculateShipping(subtotal);
    const total = Number((subtotal + shipping).toFixed(2));

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal: Number(subtotal.toFixed(2)),
      shipping,
      total,
      shippingAddress: req.body.shippingAddress,
      status: 'paid',
      paidAt: new Date(),
    });

    return ok(res, order, 201);
  } catch (error) {
    return next(error);
  }
};

const checkoutCart = async (req, res) => fail(res, 'Use /api/checkout para Mercado Pago', 400);

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('items.product', 'name imageUrl');
    return ok(res, orders);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOrder,
  checkoutCart,
  getMyOrders,
};
