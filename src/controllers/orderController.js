const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { calculateFinalPrice } = require('../services/promotionService');
const { generateWhatsAppLink } = require('../utils/whatsapp');
const HttpError = require('../utils/httpError');

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

        produtosPedido.push({
          product: product._id,
          nome: product.nome,
          quantidade: item.quantidade,
          precoUnitarioFinal: pricing.precoFinal,
          subtotal,
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
            valorTotal: Number(valorTotal.toFixed(2)),
            enderecoEntrega: user.endereco,
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
  getMyOrders,
};
