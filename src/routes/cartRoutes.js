const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove', cartController.removeCartItem);
router.delete('/clear', cartController.clearCart);
router.post('/checkout', orderController.checkoutCart);

module.exports = router;
