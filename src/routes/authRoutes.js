/**
 * Routes: mapeia endpoints HTTP para seus respectivos controllers e middlewares.
 * Arquivo: src/routes/authRoutes.js
 */
const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  bootstrapAdminValidator,
} = require('../validators/authValidator');

const router = express.Router();

router.post('/register', registerValidator, validateRequest, authController.register);
router.post('/bootstrap-admin', bootstrapAdminValidator, validateRequest, authController.bootstrapAdmin);
router.post('/register/admin', authMiddleware, authorizeRoles('admin'), registerValidator, validateRequest, authController.register);
router.post('/login', loginValidator, validateRequest, authController.login);
router.post('/refresh-token', refreshTokenValidator, validateRequest, authController.refreshToken);

module.exports = router;
