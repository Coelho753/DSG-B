/**
 * Routes: mapeia endpoints HTTP para seus respectivos controllers e middlewares.
 * Arquivo: src/routes/paymentRoutes.js
 */
import express from "express"
import { checkout, webhook } from "../controllers/paymentController.js"

const router = express.Router()

router.post("/checkout", checkout)
router.post("/webhook/mercadopago", webhook)

export default router