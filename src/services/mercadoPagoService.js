/**
 * Service: concentra regras de negócio reutilizáveis e integrações externas.
 * Arquivo: src/services/mercadoPagoService.js
 */
import mercadopago from "mercadopago"

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
})

export const createPreference = async (items) => {
  const preference = {
    items,
    back_urls: {
      success: process.env.FRONT_URL + "/success",
      failure: process.env.FRONT_URL + "/failure"
    },
    auto_return: "approved"
  }

  const response = await mercadopago.preferences.create(preference)
  return response.body.init_point
}

export const getPayment = async (id) => {
  const payment = await mercadopago.payment.findById(id)
  return payment.body
}