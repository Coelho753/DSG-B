const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const orderController = require("../controllers/orderController");

/**
 * Criar pedido
 */
router.post("/", authMiddleware, orderController.createOrder);

/**
 * Listar pedidos do usuário
 */
router.get("/my-orders", authMiddleware, orderController.getMyOrders);

module.exports = router;