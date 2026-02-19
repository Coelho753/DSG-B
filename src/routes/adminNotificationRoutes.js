const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { getAdminNotifications } = require('../controllers/adminNotificationController');

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('admin'), getAdminNotifications);

module.exports = router;
