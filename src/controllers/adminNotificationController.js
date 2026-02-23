/**
 * Controller: recebe requisições HTTP, valida entradas básicas e delega regras aos serviços/modelos.
 * Arquivo: src/controllers/adminNotificationController.js
 */
const AdminNotification = require('../models/AdminNotification');
const Cart = require('../models/Cart');

const getAdminNotifications = async (req, res, next) => {
  try {
    const notifications = await AdminNotification.find({ type: 'sale' }).sort({ createdAt: -1 }).limit(200);
    return res.json(notifications);
  } catch (error) {
    return next(error);
  }
};

const getAbandonedCarts = async (req, res, next) => {
  try {
    const carts = await Cart.find({ isAbandoned: true, items: { $exists: true, $ne: [] } })
      .populate('userId', 'nome email')
      .populate('items.productId', 'nome imageUrl preco');

    const payload = carts.map((cart) => {
      const total = cart.items.reduce((acc, item) => acc + Number(item.unitPrice || 0) * Number(item.quantity || 0), 0);
      return {
        user: cart.userId,
        itens: cart.items,
        total: Number(total.toFixed(2)),
        tempoAbandonadoMinutos: cart.abandonedAt ? Math.floor((Date.now() - new Date(cart.abandonedAt).getTime()) / 60000) : 0,
      };
    });

    return res.json(payload);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAdminNotifications, getAbandonedCarts };
