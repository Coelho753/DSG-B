const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { createOrderValidator } = require('../validators/orderValidator');

const router = express.Router();

router.use(authMiddleware);
router.post('/', createOrderValidator, validateRequest, orderController.createOrder);
router.post('/checkout', orderController.checkoutCart);
router.get('/my-orders', orderController.getMyOrders);

module.exports = router;
