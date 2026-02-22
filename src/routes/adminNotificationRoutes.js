const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { getAdminNotifications, getAbandonedCarts } = require('../controllers/adminNotificationController');

const router = express.Router();

router.get('/notifications', authMiddleware, authorizeRoles('admin'), getAdminNotifications);
router.get('/abandoned-carts', authMiddleware, authorizeRoles('admin'), getAbandonedCarts);

module.exports = router;
