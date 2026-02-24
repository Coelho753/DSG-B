const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const Cart = require("../models/Cart");

router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json(cart);
  } catch {
    res.status(500).json({ message: "Erro ao buscar carrinho" });
  }
});

module.exports = router;