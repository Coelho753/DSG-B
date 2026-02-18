const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const AdminNotification = require('../models/AdminNotification');
const { calculateFinalPrice } = require('../services/promotionService');
const { generateWhatsAppLink } = require('../utils/whatsapp');
const HttpError = require('../utils/httpError');

const resolveShippingAddress = (user, inputAddress) => {
  if (inputAddress) return inputAddress;
  if (user.address && Object.keys(user.address || {}).length) return user.address;
  return user.endereco;
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
    let valorTotal = 0;

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

        if (product.estoque < item.quantidade) {
          throw new HttpError(400, `Estoque insuficiente para ${product.nome}`);
        }

        const pricing = calculateFinalPrice(product);
        const subtotal = Number((pricing.precoFinal * item.quantidade).toFixed(2));
        const unitCost = Number(product.cost || 0);
        const profit = Number(((pricing.precoFinal - unitCost) * item.quantidade).toFixed(2));

        produtosPedido.push({
          product: product._id,
          nome: product.nome,
          quantidade: item.quantidade,
          precoUnitarioFinal: pricing.precoFinal,
          subtotal,
          unitCost,
          profit,
        });

        valorTotal += subtotal;

        product.estoque -= item.quantidade;
        product.totalVendido += item.quantidade;
        await product.save({ session });
      }

      const [order] = await Order.create(
        [
          {
            user: user._id,
            produtos: produtosPedido,
            items: produtosPedido,
            valorTotal: Number(valorTotal.toFixed(2)),
            enderecoEntrega: resolveShippingAddress(user),
          },
        ],
        { session }
      );

      const whatsappLink = generateWhatsAppLink(order);
      res.status(201).json({ order, whatsappLink });
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

    let totalPaid = 0;
    let totalProfit = 0;
    const orderItems = [];

    await session.withTransaction(async () => {
      for (const item of cart.items) {
        const product = await Product.findById(item.productId._id).session(session);
        if (!product || !product.ativo) throw new HttpError(400, `Produto inválido: ${item.productId}`);
        if (product.estoque < item.quantity) throw new HttpError(400, `Estoque insuficiente para ${product.nome}`);

        const unitPrice = Number(item.unitPrice || product.preco || 0);
        const subtotal = Number((unitPrice * item.quantity).toFixed(2));
        const unitCost = Number(product.cost || 0);
        const profit = Number(((unitPrice - unitCost) * item.quantity).toFixed(2));

        orderItems.push({
          product: product._id,
          nome: product.nome,
          quantidade: item.quantity,
          precoUnitarioFinal: unitPrice,
          subtotal,
          unitCost,
          profit,
        });

        totalPaid += subtotal;
        totalProfit += profit;

        product.estoque -= item.quantity;
        product.totalVendido += item.quantity;
        await product.save({ session });
      }

      const shippingAddress = resolveShippingAddress(user, req.body.shippingAddress);

      const [order] = await Order.create(
        [
          {
            user: user._id,
            produtos: orderItems,
            items: orderItems,
            valorTotal: Number(totalPaid.toFixed(2)),
            totalPaid: Number(totalPaid.toFixed(2)),
            profit: Number(totalProfit.toFixed(2)),
            enderecoEntrega: shippingAddress,
            shippingAddress,
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
      await cart.save({ session });

      res.status(201).json({ order, message: 'Pagamento concluído e pedido criado' });
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
