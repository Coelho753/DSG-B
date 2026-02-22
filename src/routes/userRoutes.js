const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

router.get('/me', authMiddleware, userController.getProfile);
router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateUserProfile);

router.patch(
  '/:id/role',
  authMiddleware,
  authorizeRoles('admin'),
  body('role').isIn(['user', 'admin', 'seller', 'distribuidor', 'revendedor']),
  validateRequest,
  userController.updateUserRole
);

module.exports = router;
