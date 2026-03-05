const Cart = require("../models/Cart");
const Product = require("../models/Product");

/**
 * Buscar carrinho do usuário
 */
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        total: 0,
      });
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar carrinho" });
  }
};

/**
 * Adicionar produto ao carrinho
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        quantity,
        price: product.price,
      });
    }

    cart.total = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();

    res.json(cart);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao adicionar no carrinho" });
  }
};

/**
 * Remover item do carrinho
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Carrinho não encontrado" });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    cart.total = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();

    res.json(cart);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao remover item" });
  }
};

/**
 * Limpar carrinho
 */
exports.clearCart = async (req, res) => {
  try {

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Carrinho não encontrado" });
    }

    cart.items = [];
    cart.total = 0;

    await cart.save();

    res.json({ message: "Carrinho limpo" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao limpar carrinho" });
  }
};