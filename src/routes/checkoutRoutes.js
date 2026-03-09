const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

// Criar pedido
router.post("/create-order", authMiddleware, orderController.createOrder);

// Buscar pedidos do usuário
router.get("/my-orders", authMiddleware, orderController.getMyOrders);

module.exports = router;