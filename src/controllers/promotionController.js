const Promotion = require("../models/Promotion");

// Criar promoção
exports.createPromotion = async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Listar promoções
exports.getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().populate("product");
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar promoção por ID
exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id).populate("product");
    if (!promotion) {
      return res.status(404).json({ message: "Promoção não encontrada" });
    }
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar promoção
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!promotion) {
      return res.status(404).json({ message: "Promoção não encontrada" });
    }

    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deletar promoção
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({ message: "Promoção não encontrada" });
    }

    res.json({ message: "Promoção deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};