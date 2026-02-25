const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const auth = require("../middlewares/authMiddleware");

router.get("/", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuário não autenticado" });
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
    console.error("Erro ao buscar carrinho:", error);
    res.status(500).json({ message: "Erro ao buscar carrinho" });
  }
});
    

module.exports = router;