const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const auth = require("../middlewares/authMiddleware");
const mongoose = require("mongoose");

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

router.post("/", auth, async (req, res) => {
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
      cart.items.push({
        product: productId,
        quantity
      });
    }

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

module.exports = router;