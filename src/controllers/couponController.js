const Coupon = require("../models/Coupon");

/*
========================
GET ALL COUPONS
========================
*/
exports.getCoupons = async (req, res) => {
  try {

    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.json(coupons);

  } catch (error) {

    res.status(500).json({
      message: "Erro ao buscar cupons"
    });

  }
};


/*
========================
CREATE COUPON
========================
*/
exports.createCoupon = async (req, res) => {

  try {

    const coupon = await Coupon.create(req.body);

    res.status(201).json(coupon);

  } catch (error) {

    res.status(500).json({
      message: "Erro ao criar cupom"
    });

  }

};


/*
========================
UPDATE COUPON
========================
*/
exports.updateCoupon = async (req, res) => {

  try {

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(coupon);

  } catch (error) {

    res.status(500).json({
      message: "Erro ao atualizar cupom"
    });

  }

};


/*
========================
DELETE COUPON
========================
*/
exports.deleteCoupon = async (req, res) => {

  try {

    await Coupon.findByIdAndDelete(req.params.id);

    res.json({
      message: "Cupom removido"
    });

  } catch (error) {

    res.status(500).json({
      message: "Erro ao remover cupom"
    });

  }

};


/*
========================
VALIDATE COUPON
========================
*/
exports.validateCoupon = async (req, res) => {

  try {

    const { code, orderTotal } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      active: true
    });

    if (!coupon) {
      return res.status(404).json({
        message: "Cupom inválido"
      });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Cupom expirado"
      });
    }

    if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
      return res.status(400).json({
        message: "Valor mínimo não atingido"
      });
    }

    let discount = 0;

    if (coupon.type === "percentage") {
      discount = orderTotal * (coupon.value / 100);

      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }

    } else {

      discount = coupon.value;

    }

    res.json({
      valid: true,
      discount
    });

  } catch (error) {

    res.status(500).json({
      message: "Erro ao validar cupom"
    });

  }

};