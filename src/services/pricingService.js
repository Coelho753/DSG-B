/**
 * Service: concentra regras de negócio reutilizáveis e integrações externas.
 * Arquivo: src/services/pricingService.js
 */
const Promotion = require('../models/Promotion');

// Garante que a promoção está ativa e dentro da janela de vigência.
const isPromotionActiveNow = (promotion, now = new Date()) => {
  if (!promotion || !promotion.active) return false;
  const start = new Date(promotion.startDate);
  const end = new Date(promotion.endDate);
  return start <= now && now <= end;
};

// Nunca persiste preço com desconto: cálculo sempre dinâmico em tempo de resposta.
const calculateFinalPrice = (price, discountPercentage = 0) => {
  const numericPrice = Number(price || 0);
  const numericDiscount = Number(discountPercentage || 0);
  if (numericDiscount <= 0) return Number(numericPrice.toFixed(2));
  const finalPrice = numericPrice - (numericPrice * numericDiscount) / 100;
  return Number(Math.max(finalPrice, 0).toFixed(2));
};

// Retorna um mapa productId -> melhor promoção ativa (maior desconto).
const getActivePromotionsMap = async (productIds = []) => {
  if (!productIds.length) return new Map();

  const now = new Date();
  const promotions = await Promotion.find({
    productId: { $in: productIds },
    active: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).sort({ discountPercentage: -1 });

  const promotionsMap = new Map();
  for (const promotion of promotions) {
    const key = String(promotion.productId);
    if (!promotionsMap.has(key) && isPromotionActiveNow(promotion, now)) {
      promotionsMap.set(key, promotion);
    }
  }

  return promotionsMap;
};

// Serializa produto no formato estável esperado pelo frontend Lovable.
const toProductResponse = (product, promotion) => {
  const hasPromotion = Boolean(promotion && isPromotionActiveNow(promotion));
  const discountPercentage = hasPromotion ? promotion.discountPercentage : null;
  const finalPrice = calculateFinalPrice(product.price, discountPercentage || 0);

  return {
    id: String(product._id),
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    price: Number(product.price),
    finalPrice,
    hasPromotion,
    discountPercentage,
    stock: Number(product.stock),
    soldCount: Number(product.soldCount || 0),
  };
};

module.exports = {
  calculateFinalPrice,
  getActivePromotionsMap,
  isPromotionActiveNow,
  toProductResponse,
};
