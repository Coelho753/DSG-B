const express = require("express");
const router = express.Router();

const { createOrder, getMyOrders } = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware"); // <-- IMPORTANTE

router.post("/", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getMyOrders);

module.exports = router;