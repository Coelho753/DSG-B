const express = require('express');
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { categoryValidator } = require('../validators/categoryValidator');

const router = express.Router();

router.use(authMiddleware, authorizeRoles('admin'));

router.post('/', categoryValidator, validateRequest, categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', categoryValidator, validateRequest, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
