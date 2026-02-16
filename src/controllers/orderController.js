const Order = require('../models/Order');
const Product = require('../models/Product');
const { calculateFinalPrice } = require('../services/promotionService');
const { generateWhatsAppLink } = require('../utils/whatsapp');

const createOrder = async (req, res, next) => {
  try {
    const { produtos } = req.body;
    const user = req.user;

    const produtosPedido = [];
    let valorTotal = 0;

    for (const item of produtos) {
      const product = await Product.findById(item.product);
      if (!product || !product.ativo) {
        return res.status(400).json({ message: `Produto inválido: ${item.product}` });
      }

      if (product.estoque < item.quantidade) {
        return res.status(400).json({ message: `Estoque insuficiente para ${product.nome}` });
      }

      const pricing = calculateFinalPrice(product);
      const subtotal = pricing.precoFinal * item.quantidade;

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
      await product.save();
    }

    const order = await Order.create({
      user: user._id,
      produtos: produtosPedido,
      valorTotal,
      enderecoEntrega: user.endereco,
    });

    const whatsappLink = generateWhatsAppLink(order);
    return res.status(201).json({ order, whatsappLink });
  } catch (error) {
    return next(error);
  }
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
