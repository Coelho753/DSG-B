/**
 * Controller: recebe requisições HTTP, valida entradas básicas e delega regras aos serviços/modelos.
 * Arquivo: src/controllers/productController.js
 */
import Product from "../models/Product.js"
import Promotion from "../models/Promotion.js"

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
    const promotions = await Promotion.find({ active: true })

    const now = new Date()

    const formatted = products.map(product => {
      const promo = promotions.find(p =>
        p.productId.toString() === product._id.toString() &&
        now >= p.startDate &&
        now <= p.endDate
      )

      let finalPrice = product.price
      let hasPromotion = false
      let discountPercentage = null

      if (promo) {
        finalPrice =
          product.price -
          (product.price * promo.discountPercentage) / 100

        hasPromotion = true
        discountPercentage = promo.discountPercentage
      }

      return {
        id: product._id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        price: product.price,
        finalPrice,
        hasPromotion,
        discountPercentage,
        stock: product.stock,
        soldCount: product.soldCount
      }
    })

    return res.json({ success: true, data: formatted })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar produtos"
    })
  }
}