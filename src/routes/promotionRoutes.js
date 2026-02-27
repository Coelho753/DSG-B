const express = require("express");
const router = express.Router();
const Promotion = require("../models/Promotion");
const auth = require("../middlewares/authMiddleware");

// 🔹 LISTAR promoções ativas
router.get("/", async (req, res) => {
  try {
    const promotions = await Promotion.find({ active: true });
    res.json(promotions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar promoções" });
  }
});

// 🔹 CRIAR promoção
router.post("/", auth, async (req, res) => {
  try {
    const { title, discount, active } = req.body;

    const promotion = await Promotion.create({
      title,
      discount,
      active
    });

    res.status(201).json(promotion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar promoção" });
  }
});

// 🔹 ATUALIZAR promoção
router.put("/:id", auth, async (req, res) => {
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
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar promoção" });
  }
});

// 🔹 DELETAR promoção
router.delete("/:id", auth, async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({ message: "Promoção não encontrada" });
    }

    res.json({ message: "Promoção removida com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao deletar promoção" });
  }
});

module.exports = router;