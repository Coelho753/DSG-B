/**
 * Routes: mapeia endpoints HTTP para seus respectivos controllers e middlewares.
 * Arquivo: src/routes/productRoutes.js
 */
const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const compressUploadedImages = require('../middlewares/imageCompressionMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { productCreateValidator, productUpdateValidator } = require('../validators/productValidator');
const reviewRoutes = require('./reviewRoutes');

const router = express.Router();

// Público: listagem e detalhe de produtos
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.use('/:id/reviews', reviewRoutes);

// Privado: gestão de produtos
router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin', 'seller'),
  upload.any(),
  compressUploadedImages,
  productCreateValidator,
  validateRequest,
  productController.createProduct
);

router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin', 'seller'),
  upload.any(),
  compressUploadedImages,
  productUpdateValidator,
  validateRequest,
  productController.updateProduct
);

router.delete('/:id', authMiddleware, authorizeRoles('admin', 'seller'), productController.deleteProduct);

module.exports = router;
