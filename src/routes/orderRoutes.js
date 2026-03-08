const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// rota principal
router.post("/", orderController.createOrder);

// rota compatível com checkout
router.post("/create-order", orderController.createOrder);

module.exports = router;