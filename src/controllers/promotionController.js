const Promotion = require("../models/Promotion");

exports.createPromotion = async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().populate("product");
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};