const Cart = require("../models/Cart");
const Order = require("../models/Order");
const User = require("../models/User");

const { calculateFreight } = require("../services/freightService");
const { applyCoupon } = require("../services/couponService");

exports.createCheckout = async (req, res) => {

  try {

    const { coupon } = req.body;

    const user = await User.findById(req.user.id);

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Carrinho vazio"
      });
    }

    const selectedItems = cart.items.filter(i => i.selected);

    if (selectedItems.length === 0) {
      return res.status(400).json({
        message: "Nenhum item selecionado"
      });
    }

    const subtotal = selectedItems.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);

    const freight = await calculateFreight(user);

    const discount = await applyCoupon(coupon, subtotal);

    const total = subtotal + freight - discount;

    const order = await Order.create({
      user: req.user.id,
      items: selectedItems,
      subtotal,
      freight,
      discount,
      total,
      coupon
    });

    res.json({
      message: "Pedido criado",
      order
    });

  } catch (error) {

    console.error("Erro no checkout:", error);

    res.status(500).json({
      message: "Erro no checkout"
    });

  }

};