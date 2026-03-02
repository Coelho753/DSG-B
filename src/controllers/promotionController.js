const Promotion = require("../models/Promotion");

/*
=================================================
CRIAR PROMOÇÃO
=================================================
*/
exports.createPromotion = async (req, res) => {
  try {
    const {
      title,
      type,
      value,
      product,
      category,
      startDate,
      endDate,
      hasTime,
      startTime,
      endTime,
    } = req.body;

    /*
    ==========================
    VALIDAÇÕES
    ==========================
    */

    if (!title || !type || !value || !startDate || !endDate) {
      return res.status(400).json({
        message: "Campos obrigatórios não preenchidos",
      });
    }

    if (!product && !category) {
      return res.status(400).json({
        message: "Informe produto ou categoria",
      });
    }

    if (type === "percentage" && (value <= 0 || value > 100)) {
      return res.status(400).json({
        message: "Percentual deve ser entre 1 e 100",
      });
    }

    if (type === "fixed" && value <= 0) {
      return res.status(400).json({
        message: "Valor fixo deve ser maior que zero",
      });
    }

    let start = new Date(startDate);
    let end = new Date(endDate);

    if (hasTime && startTime && endTime) {
      const [startHour, startMinute] = startTime.split(":");
      const [endHour, endMinute] = endTime.split(":");

      start.setHours(startHour, startMinute, 0, 0);
      end.setHours(endHour, endMinute, 59, 999);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    if (start > end) {
      return res.status(400).json({
        message: "Data inicial não pode ser maior que data final",
      });
    }

    /*
    ==========================
    CRIAÇÃO
    ==========================
    */

    const promotion = await Promotion.create({
      title,
      type,
      value: Number(value),
      product: product || null,
      category: category || null,
      startDate: start,
      endDate: end,
      hasTime: hasTime || false,
      startTime: hasTime ? startTime : null,
      endTime: hasTime ? endTime : null,
      active: true,
    });

    return res.status(201).json(promotion);

  } catch (error) {
    console.error("Erro ao criar promoção:", error);
    return res.status(500).json({
      message: "Erro ao criar promoção",
      error: error.message,
    });
  }
};

/*
=================================================
LISTAR TODAS AS PROMOÇÕES
=================================================
*/
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    return res.json(promotions);

  } catch (error) {
    console.error("Erro ao buscar promoções:", error);
    return res.status(500).json({
      message: "Erro ao buscar promoções",
    });
  }
};

/*
=================================================
LISTAR PROMOÇÕES ATIVAS
=================================================
*/
exports.getActivePromotions = async (req, res) => {
  try {
    const now = new Date();

    const promotions = await Promotion.find({
      active: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    return res.json(promotions);

  } catch (error) {
    console.error("Erro ao buscar promoções ativas:", error);
    return res.status(500).json({
      message: "Erro ao buscar promoções",
    });
  }
};

/*
=================================================
BUSCAR PROMOÇÃO POR ID
=================================================
*/
exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        message: "Promoção não encontrada",
      });
    }

    return res.json(promotion);

  } catch (error) {
    console.error("Erro ao buscar promoção:", error);
    return res.status(500).json({
      message: "Erro ao buscar promoção",
    });
  }
};

/*
=================================================
ATUALIZAR PROMOÇÃO
=================================================
*/
exports.updatePromotion = async (req, res) => {
  try {
    const updated = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Promoção não encontrada",
      });
    }

    return res.json(updated);

  } catch (error) {
    console.error("Erro ao atualizar promoção:", error);
    return res.status(500).json({
      message: "Erro ao atualizar promoção",
      error: error.message,
    });
  }
};

/*
=================================================
DELETAR PROMOÇÃO
=================================================
*/
exports.deletePromotion = async (req, res) => {
  try {
    const deleted = await Promotion.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Promoção não encontrada",
      });
    }

    return res.json({
      message: "Promoção removida com sucesso",
    });

  } catch (error) {
    console.error("Erro ao deletar promoção:", error);
    return res.status(500).json({
      message: "Erro ao deletar promoção",
    });
  }
};