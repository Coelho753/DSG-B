/**
 * Service: concentra regras de negócio reutilizáveis e integrações externas.
 * Arquivo: src/services/promotionService.js
 */
const { calculateFinalPrice: calculatePriceWithDiscount } = require('./pricingService');

const calculateFinalPrice = (product, discountPercentage = null) => {
  const originalPrice = Number(product.price || 0);
  const resolvedDiscount = discountPercentage === null ? 0 : Number(discountPercentage || 0);
  const finalPrice = calculatePriceWithDiscount(originalPrice, resolvedDiscount);

  return {
    precoOriginal: originalPrice,
    precoFinal: finalPrice,
    descontoPercentualCalculado: resolvedDiscount,
    promocaoAtiva: resolvedDiscount > 0,
  };
};

module.exports = {
  calculateFinalPrice,
};
