const express = require("express");
const router = express.Router();
const Promotion = require("../models/Promotion");

router.get("/", async (req, res) => {
  try {
    const promotions = await Promotion.find({ active: true });
    res.json(promotions);
  } catch {
    res.status(500).json({ message: "Erro ao buscar promoções" });
  }
});

module.exports = router;