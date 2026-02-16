const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { productValidator } = require('../validators/productValidator');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin', 'distribuidor', 'revendedor'),
  upload.array('imagens', 10),
  productValidator,
  validateRequest,
  productController.createProduct
);

router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin', 'distribuidor', 'revendedor'),
  upload.array('imagens', 10),
  productController.updateProduct
);

router.delete('/:id', authMiddleware, authorizeRoles('admin', 'distribuidor', 'revendedor'), productController.deleteProduct);

module.exports = router;
