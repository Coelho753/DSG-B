/**
 * Routes: mapeia endpoints HTTP para seus respectivos controllers e middlewares.
 * Arquivo: src/routes/paymentRoutes.js
 */
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.get('/payment/config', paymentController.getPaymentConfig);
router.post('/checkout', authMiddleware, paymentController.checkout);
router.post('/webhook/mercadopago', paymentController.mercadoPagoWebhook);

module.exports = router;
