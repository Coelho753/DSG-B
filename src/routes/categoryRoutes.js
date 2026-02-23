/**
 * Routes: mapeia endpoints HTTP para seus respectivos controllers e middlewares.
 * Arquivo: src/routes/categoryRoutes.js
 */
const express = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { categoryValidator } = require('../validators/categoryValidator');

const router = express.Router();

// Público: listagem e detalhe
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Privado (admin): gestão
router.post('/', authMiddleware, authorizeRoles('admin'), categoryValidator, validateRequest, categoryController.createCategory);
router.put('/:id', authMiddleware, authorizeRoles('admin'), categoryValidator, validateRequest, categoryController.updateCategory);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), categoryController.deleteCategory);

module.exports = router;
