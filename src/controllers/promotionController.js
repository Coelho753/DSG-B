const Promotion = require("../models/Promotion");

// Criar
const Promotion = require("../models/Promotion");

exports.createPromotion = async (req, res) => {
  try {
    const {
      type,
      value,
      startDate,
      endDate,
      product,
      category,
    } = req.body;

    /*
    =============================
    VALIDAÇÕES SEGURAS
    =============================
    */

    if (!type || !value) {
      return res.status(400).json({
        message: "Tipo e valor são obrigatórios",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Datas são obrigatórias",
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "Data final não pode ser menor que inicial",
      });
    }

    if (!product && !category) {
      return res.status(400).json({
        message: "Informe produto ou categoria",
      });
    }

    const promotion = await Promotion.create({
      type,
      value: Number(value),
      startDate,
      endDate,
      product: product || null,
      category: category || null,
      active: true,
    });

    res.status(201).json(promotion);

  } catch (error) {
    console.error("ERRO DETALHADO PROMOTION:", error);
    res.status(500).json({
      message: "Erro ao criar promoção",
      error: error.message,
    });
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