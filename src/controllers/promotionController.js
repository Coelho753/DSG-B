const Promotion = require("../models/Promotion");

// Criar
exports.createPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.create(req.body);
    res.status(201).json(promotion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar promoção" });
  }
};

// Listar
exports.getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar promoções" });
  }
};

// Buscar por ID
exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: "Promoção não encontrada" });
    }
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar promoção" });
  }
};

// Atualizar
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
    res.status(500).json({ message: "Erro ao atualizar promoção" });
  }
};

// Deletar
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({ message: "Promoção não encontrada" });
    }

    res.json({ message: "Promoção removida com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar promoção" });
  }
};