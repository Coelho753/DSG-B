const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middlewares/authMiddleware");

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

    console.error("Erro detalhado ao buscar carrinho:", error);

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

      cart.items[itemIndex].quantity += quantity;

    } else {

      cart.items.push({
        product: productId,
        name: product.name,
        price: product.price,
        quantity
      });

    }

    /* recalcular total */

    cart.total = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

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

    cart.total = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();

    res.json(cart);

  } catch (error) {

    console.error("Erro ao remover do carrinho:", error);

    res.status(500).json({
      message: "Erro ao remover do carrinho",
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

    res.json({ message: "Carrinho limpo" });

  } catch (error) {

    console.error("Erro ao limpar carrinho:", error);

    res.status(500).json({
      message: "Erro ao limpar carrinho",
      error: error.message
    });

  }
});


module.exports = router;