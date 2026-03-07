const Cart = require("../models/Cart");
const User = require("../models/User");

exports.getCheckout = async (req, res) => {

  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

  const selectedItems = cart.items.filter(i => i.selected);

  if (!selectedItems.length) {
    return res.status(400).json({
      message: "Nenhum produto selecionado"
    });
  }

  const user = await User.findById(req.user.id);

  /* CALCULAR FRETE */

  const shipping = await calcularFrete({
    postal_code: user.address.zipCode,
    products: selectedItems
  });

  const subtotal = selectedItems.reduce((acc, item) => {
    return acc + item.product.price * item.quantity;
  }, 0);

  const total = subtotal + shipping.price;

  res.json({

    items: selectedItems,

    subtotal,

    shipping,

    total

  });

};