const Cart = require("../models/Cart");
const Product = require("../models/Product");

/**
 * Buscar carrinho do usuário
 */
exports.getCart = async (req, res) => {
  try {

    let cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        total: 0
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
        items: []
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
        selected: true
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
 * Selecionar / desmarcar item
 */
exports.toggleItemSelection = async (req, res) => {

  try {

    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Carrinho não encontrado" });
    }

    const item = cart.items.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Produto não encontrado no carrinho"
      });
    }

    item.selected = !item.selected;

    await cart.save();

    res.json(cart);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Erro ao selecionar item" });

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

/**
 * Buscar apenas itens selecionados para checkout
 */
exports.getSelectedItems = async (req, res) => {

  try {

    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart) {
      return res.status(404).json({ message: "Carrinho não encontrado" });
    }

    const selectedItems = cart.items.filter(item => item.selected);

    if (!selectedItems.length) {
      return res.status(400).json({
        message: "Nenhum produto selecionado"
      });
    }

    const subtotal = selectedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    res.json({
      items: selectedItems,
      subtotal
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Erro no checkout" });

  }

};