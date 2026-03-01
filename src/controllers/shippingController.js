const Product = require("../models/Product");
const shippingService = require("../services/shippingService");

exports.calculateShipping = async (req, res) => {
  try {
    const { zipcode, cartItems } = req.body;

    if (!zipcode || !cartItems) {
      return res.status(400).json({ message: "Dados inválidos" });
    }

    const products = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      products.push({
        ...product.toObject(),
        quantity: item.quantity,
      });
    }

    const shippingOptions = await shippingService.calculateShipping({
      zipcode,
      products,
    });

    res.json(shippingOptions);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};