const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkoutController");

router.post("/create-order", checkoutController.createOrder);

module.exports = router;