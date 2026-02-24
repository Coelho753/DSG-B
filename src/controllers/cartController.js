const Cart = require("../models/Cart");

// Buscar carrinho do usuário logado
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(cart);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar carrinho" });
  }
};

// Adicionar produto ao carrinho
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    res.json(cart);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao adicionar ao carrinho" });
  }
};

// Remover item
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Carrinho não encontrado" });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();

    res.json(cart);

  } catch (error) {
    res.status(500).json({ message: "Erro ao remover item" });
  }
};