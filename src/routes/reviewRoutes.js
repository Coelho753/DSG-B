/**
 * Routes: mapeia endpoints HTTP para seus respectivos controllers e middlewares.
 * Arquivo: src/routes/reviewRoutes.js
 */
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.get('/', reviewController.listReviews);
router.post('/', authMiddleware, reviewController.upsertReview);

module.exports = router;
