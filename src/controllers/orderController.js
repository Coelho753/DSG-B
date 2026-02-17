const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { calculateFinalPrice } = require('../services/promotionService');
const { generateWhatsAppLink } = require('../utils/whatsapp');
const HttpError = require('../utils/httpError');

/* ================= CREATE ORDER ================= */

const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    if (req.user.role !== 'user') {
      throw new HttpError(403, 'Apenas usuário comum pode criar pedidos');
    }

    const produtos = req.body.produtos || req.body.items || [];
    if (!Array.isArray(produtos) || produtos.length === 0) {
      throw new HttpError(400, 'Pedido precisa conter produtos');
    }

    const produtosPedido = [];
    let valorTotal = 0;

    await session.withTransaction(async () => {
      for (const rawItem of produtos) {
        const productId = rawItem.product || rawItem.productId;
        const quantidade = Number(rawItem.quantidade ?? rawItem.quantity);

        if (!productId || !quantidade || quantidade <= 0) {
          throw new HttpError(400, 'Item inválido no pedido');
        }

        const product = await Product.findById(productId).session(session);

        if (!product || !product.ativo) {
          throw new HttpError(400, `Produto inválido: ${productId}`);
        }

        if (product.estoque < quantidade) {
          throw new HttpError(
            400,
            `Estoque insuficiente para ${product.nome}`
          );
        }

        const pricing = calculateFinalPrice(product);
        const subtotal = Number(
          (pricing.precoFinal * quantidade).toFixed(2)
        );

        produtosPedido.push({
          product: product._id,
          nome: product.nome,
          quantidade,
          precoUnitarioFinal: pricing.precoFinal,
          subtotal,
        });

        valorTotal += subtotal;

        product.estoque -= quantidade;
        product.totalVendido += quantidade;
        await product.save({ session });
      }

      const [order] = await Order.create(
        [
          {
            user: req.user._id,
            produtos: produtosPedido,
            valorTotal: Number(valorTotal.toFixed(2)),
            enderecoEntrega: req.user.endereco,
          },
        ],
        { session }
      );

      const whatsappLink = generateWhatsAppLink(order);

      res.status(201).json({
        order,
        whatsappLink,
      });
    });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};

/* ================= GET MY ORDERS ================= */

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('produtos.product', 'nome');

    return res.json(orders);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
};
