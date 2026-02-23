const express = require("express");
const router = express.Router();

const promotionController = require("../controllers/promotionController");
const authMiddleware = require("../middlewares/authMiddleware");

// Criar promoção
router.post("/", authMiddleware, promotionController.createPromotion);

// Listar promoções
router.get("/", promotionController.getPromotions);

// Buscar promoção por ID
router.get("/:id", promotionController.getPromotionById);

// Atualizar promoção
router.put("/:id", authMiddleware, promotionController.updatePromotion);

// Deletar promoção
router.delete("/:id", authMiddleware, promotionController.deletePromotion);

module.exports = router;