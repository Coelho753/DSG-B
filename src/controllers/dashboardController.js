/**
 * Controller: recebe requisições HTTP, valida entradas básicas e delega regras aos serviços/modelos.
 * Arquivo: src/controllers/dashboardController.js
 */
const dayjs = require('dayjs');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { ok } = require('../utils/apiResponse');

const getMetrics = async (req, res, next) => {
  try {
    const startMonth = dayjs().startOf('month').toDate();
    const [totalProdutos, produtosEstoqueBaixo, vendasMes, produtosMaisVendidos] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lte: 5, $ne: -1 } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startMonth }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Product.find().sort({ soldCount: -1 }).limit(10).select('name soldCount price'),
    ]);

    return ok(res, {
      totalProdutos,
      produtosEstoqueBaixo,
      vendasMes: vendasMes[0]?.total || 0,
      produtosMaisVendidos,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getMetrics };
