const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middlewares/authMiddleware");

/*
==============================
FUNÇÃO PARA RECALCULAR TOTAL
==============================
*/
function calculateCartTotal(cart) {
  return cart.items.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return acc + price * qty;
  }, 0);
}

/*
==============================
BUSCAR CARRINHO DO USUÁRIO
==============================
*/
router.get("/", auth, async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    let cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        total: 0
      });
    }

    res.json(cart);

  } catch (error) {

    console.error("Erro ao buscar carrinho:", error);

    res.status(500).json({
      message: "Erro ao buscar carrinho",
      error: error.message
    });
  }
});


/*
==============================
ADICIONAR PRODUTO AO CARRINHO
==============================
*/
router.post("/", auth, async (req, res) => {

  try {

    const { productId, quantity = 1 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Produto inválido" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    const price = Number(product.price || product.finalPrice || 0);

    if (!price) {
      return res.status(400).json({
        message: "Produto sem preço definido"
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        total: 0
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex > -1) {

      cart.items[itemIndex].quantity += Number(quantity);

    } else {

      cart.items.push({
        product: productId,
        name: product.name,
        price: price,
        quantity: Number(quantity),
        selected: true
      });

    }

    cart.total = calculateCartTotal(cart);

    await cart.save();

    res.json(cart);

  } catch (error) {

    console.error("Erro ao adicionar ao carrinho:", error);

    res.status(500).json({
      message: "Erro ao adicionar ao carrinho",
      error: error.message
    });

  }

});


/*
==============================
ATUALIZAR QUANTIDADE
==============================
*/
router.put("/quantity", auth, async (req, res) => {

  try {

    const { productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Produto inválido" });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Carrinho não encontrado" });
    }

    const item = cart.items.find(
      i => i.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item não encontrado" });
    }

    item.quantity = Number(quantity);

    cart.total = calculateCartTotal(cart);

    await cart.save();

    res.json(cart);

  } catch (error) {

    console.error("Erro ao atualizar quantidade:", error);

    res.status(500).json({
      message: "Erro ao atualizar quantidade",
      error: error.message
    });

  }

});


/*
==============================
SELECIONAR ITEM PARA CHECKOUT
==============================
*/
router.put("/select", auth, async (req, res) => {

  try {

    const { productId, selected } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Carrinho não encontrado" });
    }

    const item = cart.items.find(
      i => i.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item não encontrado" });
    }

    item.selected = Boolean(selected);

    await cart.save();

    res.json(cart);

  } catch (error) {

    console.error("Erro ao selecionar item:", error);

    res.status(500).json({
      message: "Erro ao selecionar item",
      error: error.message
    });

  }

});


/*
==============================
REMOVER ITEM DO CARRINHO
==============================
*/
router.delete("/:productId", auth, async (req, res) => {

  try {

    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Carrinho não encontrado" });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    cart.total = calculateCartTotal(cart);

    await cart.save();

    res.json(cart);

  } catch (error) {

    console.error("Erro ao remover item:", error);

    res.status(500).json({
      message: "Erro ao remover item",
      error: error.message
    });

  }

});


/*
==============================
LIMPAR CARRINHO
==============================
*/
router.delete("/clear/all", auth, async (req, res) => {

  try {

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Carrinho não encontrado" });
    }

    cart.items = [];
    cart.total = 0;

    await cart.save();

    res.json({
      message: "Carrinho limpo"
    });

  } catch (error) {

    console.error("Erro ao limpar carrinho:", error);

    res.status(500).json({
      message: "Erro ao limpar carrinho",
      error: error.message
    });

  }

});

module.exports = router;