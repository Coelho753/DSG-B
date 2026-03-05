const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");

router.get("/my-orders", authMiddleware, getMyOrders);

router.post("/", orderController.createOrder);

module.exports = router;