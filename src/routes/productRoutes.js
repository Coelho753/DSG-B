const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const compressUploadedImages = require('../middlewares/imageCompressionMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { productValidator } = require('../validators/productValidator');

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('admin', 'seller'), productController.getProducts);
router.get('/:id', authMiddleware, authorizeRoles('admin', 'seller'), productController.getProductById);

router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin', 'seller'),
  upload.array('imagens', 10),
  compressUploadedImages,
  productValidator,
  validateRequest,
  productController.createProduct
);

router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin', 'seller'),
  upload.array('imagens', 10),
  compressUploadedImages,
  productController.updateProduct
);

router.delete('/:id', authMiddleware, authorizeRoles('admin', 'seller'), productController.deleteProduct);

module.exports = router;
