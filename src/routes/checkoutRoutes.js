const express = require("express");

const router = express.Router();

const auth = require("../middlewares/authMiddleware");

const checkoutController = require("../controllers/checkoutController");

router.post(
  "/",
  auth,
  checkoutController.createCheckout
);

module.exports = router;