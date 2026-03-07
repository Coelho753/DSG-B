const express = require("express");

const router = express.Router();

const webhook = require("../webhooks/mercadoPagoWebhook");

router.post(
  "/mercadopago",
  webhook.mercadoPagoWebhook
);

module.exports = router;