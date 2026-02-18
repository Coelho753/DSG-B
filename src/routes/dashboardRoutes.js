const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { getMetrics } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/metrics', authMiddleware, authorizeRoles('admin', 'seller'), getMetrics);

module.exports = router;
