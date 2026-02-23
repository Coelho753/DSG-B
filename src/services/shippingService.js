/**
 * Service: concentra regras de negócio reutilizáveis e integrações externas.
 * Arquivo: src/services/shippingService.js
 */
const calculateShipping = (subtotal) => {
  const numericSubtotal = Number(subtotal || 0);
  if (numericSubtotal >= 149) return 0;
  return 19.9;
};

module.exports = {
  calculateShipping,
};
