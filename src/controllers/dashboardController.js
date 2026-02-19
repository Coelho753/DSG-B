const dayjs = require('dayjs');
const Product = require('../models/Product');
const Order = require('../models/Order');

const getMetrics = async (req, res, next) => {
  try {
    const startMonth = dayjs().startOf('month').toDate();
    const [
      totalProdutos,
      produtosAtivos,
      produtosEstoqueBaixo,
      vendasMes,
      produtosMaisVendidos,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ ativo: true }),
      Product.countDocuments({ estoque: { $lte: 5 } }),
      Order.aggregate([
        { $match: { criadoEm: { $gte: startMonth } } },
        { $group: { _id: null, total: { $sum: '$valorTotal' } } },
      ]),
      Product.find().sort({ totalVendido: -1 }).limit(10).select('nome totalVendido preco'),
    ]);

    return res.json({
      totalProdutos,
      produtosAtivos,
      produtosEstoqueBaixo,
      vendasMes: vendasMes[0]?.total || 0,
      produtosMaisVendidos,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getMetrics };
