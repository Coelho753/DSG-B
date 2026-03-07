const Coupon = require("../models/Coupon");

async function applyCoupon(code, subtotal) {

  if (!code) return 0;

  const coupon = await Coupon.findOne({
    code,
    active: true
  });

  if (!coupon) return 0;

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return 0;
  }

  if (coupon.discountType === "percent") {
    return subtotal * (coupon.value / 100);
  }

  return coupon.value;
}

module.exports = { applyCoupon };