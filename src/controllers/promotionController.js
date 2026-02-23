const Promotion = require("../models/Promotion");

const createPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.create(req.body);
    res.status(201).json(promotion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar promoção" });
  }
};

module.exports = {
  createPromotion
};