const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
  try {

    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Itens obrigatórios" });
    }

    let subtotal = 0;

    const orderItems = [];

    for (const item of items) {

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      const price = product.price;
      const total = price * item.quantity;

      subtotal += total;

      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity: item.quantity
      });

    }

    const freight = 20;

    const total = subtotal + freight;

    const order = await Order.create({
      items: orderItems,
      shippingAddress,
      subtotal,
      freight,
      total,
      status: "pending"
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