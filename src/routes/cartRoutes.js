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

module.exports = router;