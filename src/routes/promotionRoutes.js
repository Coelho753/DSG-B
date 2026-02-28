const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const promotionController = require("../controllers/promotionController");

/*
=================================================
LISTAR TODAS AS PROMOÇÕES
=================================================
*/
router.get("/", promotionController.getAllPromotions);

/*
=================================================
LISTAR PROMOÇÕES ATIVAS (FILTRADAS POR DATA)
Opcional: /api/promotions/active
=================================================
*/
router.get("/active", promotionController.getActivePromotions);

/*
=================================================
BUSCAR PROMOÇÃO POR ID
=================================================
*/
router.get("/:id", promotionController.getPromotionById);

/*
=================================================
CRIAR PROMOÇÃO (PROTEGIDO)
=================================================
*/
router.post("/", auth, promotionController.createPromotion);

/*
=================================================
ATUALIZAR PROMOÇÃO
=================================================
*/
router.put("/:id", auth, promotionController.updatePromotion);

/*
=================================================
DELETAR PROMOÇÃO
=================================================
*/
router.delete("/:id", auth, promotionController.deletePromotion);

module.exports = router;