/**
 * Controller: recebe requisições HTTP, valida entradas básicas e delega regras aos serviços/modelos.
 * Arquivo: src/controllers/promotionController.js
 */
import Promotion from "../models/Promotion.js"

export const createPromotion = async (req, res) => {
  try {
    const {
      productId,
      discountPercentage,
      startDate,
      endDate,
      active
    } = req.body

    const promotion = await Promotion.create({
      productId,
      discountPercentage,
      startDate,
      endDate,
      active
    })

    return res.status(201).json({
      success: true,
      data: promotion
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Erro ao criar promoção"
    })
  }
}