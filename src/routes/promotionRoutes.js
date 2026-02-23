/**
 * Routes: mapeia endpoints HTTP para seus respectivos controllers e middlewares.
 * Arquivo: src/routes/promotionRoutes.js
 */
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { zodValidator, promotionSchema } = require('../validators/adminValidators');
const promotionController = require('../controllers/promotionController');

const router = express.Router();

router.use(authMiddleware, authorizeRoles('admin', 'seller'));

router.get('/', promotionController.getPromotions);
router.post('/', zodValidator(promotionSchema), promotionController.createPromotion);
router.put('/:id', zodValidator(promotionSchema), promotionController.updatePromotion);
router.delete('/:id', promotionController.deletePromotion);

module.exports = router;
