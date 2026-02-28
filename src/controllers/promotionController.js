const Promotion = require("../models/Promotion");

/*
=================================================
CRIAR PROMOÇÃO
Aceita campos PT/EN e gera title automático
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

    if (!title || !type || !value || !startDate || !endDate) {
      return res.status(400).json({
        message: "Campos obrigatórios não preenchidos",
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
      // aplica horário específico
      const [startHour, startMinute] = startTime.split(":");
      const [endHour, endMinute] = endTime.split(":");

      start.setHours(startHour, startMinute, 0, 0);
      end.setHours(endHour, endMinute, 59, 999);
    } else {
      // promoção por dia inteiro
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    if (start > end) {
      return res.status(400).json({
        message: "Data inicial não pode ser maior que data final",
      });
    }

    const promotion = await Promotion.create({
      title,
      type,
      value,
      product: product || null,
      category: category || null,
      startDate: start,
      endDate: end,
      hasTime: hasTime || false,
      startTime: hasTime ? startTime : null,
      endTime: hasTime ? endTime : null,
      active: true,
    });

    res.status(201).json(promotion);

  } catch (error) {
    console.error("Erro ao criar promoção:", error);
    res.status(500).json({ message: "Erro ao criar promoção" });
  }
};
    /*
    ==========================
    VALIDAÇÕES
    ==========================
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

    if (!product && !category) {
      return res.status(400).json({
        message: "Informe produto ou categoria",
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "Data final não pode ser menor que a inicial",
      });
    }

    const promotion = await Promotion.create({
      title,
      type,
      value: Number(value),
      product,
      category,
      startDate,
      endDate,
      active,
    });

    res.status(201).json(promotion);

  } catch (error) {
    console.error("ERRO AO CRIAR PROMOÇÃO:", error);
    res.status(500).json({
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
    res.json(promotions);
  } catch (error) {
    console.error("Erro ao buscar promoções:", error);
    res.status(500).json({
      message: "Erro ao buscar promoções",
    });
  }
};

/*
=================================================
LISTAR PROMOÇÕES ATIVAS (POR DATA)
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

    res.json(promotions);

  } catch (error) {
    console.error("Erro ao buscar promoções ativas:", error);
    res.status(500).json({
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

    res.json(promotion);

  } catch (error) {
    console.error("Erro ao buscar promoção:", error);
    res.status(500).json({
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

    res.json(updated);

  } catch (error) {
    console.error("Erro ao atualizar promoção:", error);
    res.status(500).json({
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

    res.json({
      message: "Promoção removida com sucesso",
    });

  } catch (error) {
    console.error("Erro ao deletar promoção:", error);
    res.status(500).json({
      message: "Erro ao deletar promoção",
    });
  }
};