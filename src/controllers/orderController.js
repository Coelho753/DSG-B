const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const AdminNotification = require('../models/AdminNotification');
const { calculateFinalPrice } = require('../services/promotionService');
const { generateWhatsAppLink } = require('../utils/whatsapp');
const HttpError = require('../utils/httpError');

const FREE_SHIPPING_THRESHOLD = 149;
const DEFAULT_SHIPPING_FEE = 19.9;

const resolveShippingAddress = (user, inputAddress) => {
  if (inputAddress) return inputAddress;
  if (user.address && Object.keys(user.address || {}).length) return user.address;
  return user.endereco;
};

const hasInfiniteStock = (product) => {
  const stock = Number(product.stock ?? product.estoque);
  return stock === -1 || product.stock === null || product.estoque === null;
};

const calculateShipping = (subtotal) => {
  const frete = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
  return {
    shippingFee: Number(frete.toFixed(2)),
    shippingMessage: 'Frete grátis acima de R$149',
  };
};

const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    if (req.user.role !== 'user') {
      throw new HttpError(403, 'Apenas usuário comum pode criar pedidos');
    }

    const produtos = req.body.produtos || req.body.items || [];
    const user = req.user;

    const produtosPedido = [];
    let subtotal = 0;

    await session.withTransaction(async () => {
      for (const rawItem of produtos) {
        const item = {
          product: rawItem.product || rawItem.productId,
          quantidade: Number(rawItem.quantidade ?? rawItem.quantity),
        };
        const product = await Product.findById(item.product).session(session);
        if (!product || !product.ativo) {
          throw new HttpError(400, `Produto inválido: ${item.product}`);
        }

        const infiniteStock = hasInfiniteStock(product);
        if (!infiniteStock && product.estoque < item.quantidade) {
          throw new HttpError(400, `Estoque insuficiente para ${product.nome}`);
        }

        const pricing = calculateFinalPrice(product);
        const itemSubtotal = Number((pricing.precoFinal * item.quantidade).toFixed(2));
        const unitCost = Number(product.cost || 0);
        const profit = Number(((pricing.precoFinal - unitCost) * item.quantidade).toFixed(2));

        produtosPedido.push({
          product: product._id,
          nome: product.nome,
          quantidade: item.quantidade,
          precoUnitarioFinal: pricing.precoFinal,
          subtotal: itemSubtotal,
          unitCost,
          profit,
        });

        subtotal += itemSubtotal;

        if (!infiniteStock) product.estoque -= item.quantidade;
        product.totalVendido += item.quantidade;
        product.soldCount += item.quantidade;
        await product.save({ session });
      }

      const shipping = calculateShipping(subtotal);
      const valorTotal = Number((subtotal + shipping.shippingFee).toFixed(2));

      const [order] = await Order.create(
        [
          {
            user: user._id,
            produtos: produtosPedido,
            items: produtosPedido,
            valorTotal,
            totalPaid: valorTotal,
            enderecoEntrega: resolveShippingAddress(user),
            shippingFee: shipping.shippingFee,
          },
        ],
        { session }
      );

      const whatsappLink = generateWhatsAppLink(order);
      res.status(201).json({ order, whatsappLink, ...shipping });
    });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }

  return null;
};

const checkoutCart = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const user = req.user;
    const cart = await Cart.findOne({ userId: user._id }).populate('items.productId').session(session);
    if (!cart || !cart.items.length) {
      return res.status(400).json({ message: 'Carrinho vazio' });
    }

    let subtotal = 0;
    let totalProfit = 0;
    const orderItems = [];

    await session.withTransaction(async () => {
      for (const item of cart.items) {
        const product = await Product.findById(item.productId._id).session(session);
        if (!product || !product.ativo) throw new HttpError(400, `Produto inválido: ${item.productId}`);

        const infiniteStock = hasInfiniteStock(product);
        if (!infiniteStock && product.estoque < item.quantity) throw new HttpError(400, `Estoque insuficiente para ${product.nome}`);

        const unitPrice = Number(item.unitPrice || product.preco || 0);
        const itemSubtotal = Number((unitPrice * item.quantity).toFixed(2));
        const unitCost = Number(product.cost || 0);
        const profit = Number(((unitPrice - unitCost) * item.quantity).toFixed(2));

        orderItems.push({
          product: product._id,
          nome: product.nome,
          quantidade: item.quantity,
          precoUnitarioFinal: unitPrice,
          subtotal: itemSubtotal,
          unitCost,
          profit,
        });

        subtotal += itemSubtotal;
        totalProfit += profit;

        if (!infiniteStock) product.estoque -= item.quantity;
        product.totalVendido += item.quantity;
        product.soldCount += item.quantity;
        await product.save({ session });
      }

      const shipping = calculateShipping(subtotal);
      const totalPaid = Number((subtotal + shipping.shippingFee).toFixed(2));
      const shippingAddress = resolveShippingAddress(user, req.body.shippingAddress);

      const [order] = await Order.create(
        [
          {
            user: user._id,
            produtos: orderItems,
            items: orderItems,
            valorTotal: totalPaid,
            totalPaid,
            profit: Number(totalProfit.toFixed(2)),
            enderecoEntrega: shippingAddress,
            shippingAddress,
            shippingFee: shipping.shippingFee,
            paidAt: new Date(),
            status: 'paid',
          },
        ],
        { session }
      );

      const topItem = orderItems[0];
      await AdminNotification.create(
        [
          {
            type: 'sale',
            productName: topItem?.nome || 'Venda de múltiplos produtos',
            paidAt: order.paidAt,
            totalPaid: order.totalPaid,
            profit: order.profit,
            shippingAddress,
            orderId: order._id,
          },
        ],
        { session }
      );

      cart.items = [];
      cart.updatedAt = new Date();
      cart.isAbandoned = false;
      cart.abandonedAt = null;
      await cart.save({ session });

      res.status(201).json({ order, message: 'Pagamento concluído e pedido criado', ...shipping });
    });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }

  return null;
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ criadoEm: -1 }).populate('produtos.product', 'nome');
    return res.json(orders);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOrder,
  checkoutCart,
  getMyOrders,
};
