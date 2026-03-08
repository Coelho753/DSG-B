const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");

/*
========================
CRIAR PEDIDO
========================
*/

exports.createOrder = async (req, res) => {

  try {

    const userId = req.user?.id;

    const { couponCode } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

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

    let subtotal = 0;

    const items = selectedItems.map(item => {

      const total = item.price * item.quantity;
      subtotal += total;

      return {
        product: item.product._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      };

    });

    let discount = 0;

    if (couponCode) {

      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        active: true
      });

      if (coupon) {

        if (coupon.type === "percentage") {
          discount = subtotal * (coupon.value / 100);
        } else {
          discount = coupon.value;
        }

      }

    }

    const freight = 20; // pode integrar com correios depois

    const total = subtotal - discount + freight;

    const order = await Order.create({

      user: userId,
      items,
      subtotal,
      discount,
      freight,
      total,
      coupon: couponCode || null

    });

    res.json({
      orderId: order._id,
      total
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erro ao criar pedido"
    });

  }

};