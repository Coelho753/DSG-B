/**
 /**
 * Routes: mapeia endpoints HTTP para seus respectivos controllers e middlewares.
 * Arquivo: src/routes/userRoutes.js
 */

const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// Buscar perfil do usuário logado
router.get('/me', authMiddleware, userController.getProfile);

// Atualizar perfil do usuário logado
router.put(
  '/profile',
  authMiddleware,
  userController.updateProfile
);

// Atualizar role (apenas admin)
router.patch(
  '/:id/role',
  authMiddleware,
  authorizeRoles('admin'),
  body('role').isIn(['user', 'admin', 'seller', 'distribuidor', 'revendedor']),
  validateRequest,
  userController.updateUserRole
);

module.exports = router;