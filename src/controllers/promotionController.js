const Promotion = require("../models/Promotion");

/*
=================================================
CRIAR PROMOÇÃO
Aceita campos PT/EN e gera title automático
=================================================
*/
exports.createPromotion = async (req, res) => {
  try {
    // Normalização bilíngue
    const type =
      req.body.type ||
      req.body.discountType ||
      req.body.tipoDesconto;

    const value =
      req.body.value ||
      req.body.discountValue ||
      req.body.valorDesconto;

    const product =
      req.body.product ||
      req.body.productId ||
      req.body.produto ||
      null;

    const category =
      req.body.category ||
      req.body.categoria ||
      null;

    const startDate =
      req.body.startDate ||
      req.body.dataInicio;

    const endDate =
      req.body.endDate ||
      req.body.dataFim;

    const active =
      req.body.active !== undefined
        ? req.body.active
        : req.body.ativa !== undefined
        ? req.body.ativa
        : true;

    // Geração automática de título se não vier
    const title =
      req.body.title ||
      req.body.titulo ||
      `Promoção ${type === "percentage" ? value + "%" : "R$ " + value}`;

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