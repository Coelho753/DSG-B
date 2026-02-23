/**
 * Controller: recebe requisições HTTP, valida entradas básicas e delega regras aos serviços/modelos.
 * Arquivo: src/controllers/paymentController.js
 */
import Product from "../models/Product.js"
import { createPreference, getPayment } from "../services/mercadoPagoService.js"

export const checkout = async (req, res) => {
  try {
    const { items } = req.body

    const mpItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product) continue

      mpItems.push({
        title: product.name,
        unit_price: product.price,
        quantity: item.quantity,
        picture_url: product.imageUrl
      })
    }

    const url = await createPreference(mpItems)

    return res.json({
      success: true,
      data: { checkoutUrl: url }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro no checkout"
    })
  }
}

export const webhook = async (req, res) => {
  try {
    const paymentId = req.query["data.id"]

    if (!paymentId) return res.sendStatus(200)

    const payment = await getPayment(paymentId)

    if (payment.status === "approved") {
      // aqui você atualiza pedido e incrementa soldCount
    }

    return res.sendStatus(200)
  } catch {
    return res.sendStatus(200)
  }
}