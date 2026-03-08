const express = require("express");
const router = express.Router();

const couponController = require("../controllers/couponController");

/*
CRUD
*/

router.get("/", couponController.getCoupons);

router.post("/", couponController.createCoupon);

router.put("/:id", couponController.updateCoupon);

router.delete("/:id", couponController.deleteCoupon);

/*
VALIDAÇÃO PARA CHECKOUT
*/

router.post("/validate", couponController.validateCoupon);

module.exports = router;