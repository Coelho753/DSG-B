/**
 * Routes: mapeia endpoints HTTP para seus respectivos controllers e middlewares.
 * Arquivo: src/routes/settingsRoutes.js
 */
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { zodValidator, settingsSchema } = require('../validators/adminValidators');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

router.use(authMiddleware, authorizeRoles('admin'));

router.get('/', settingsController.getSettings);
router.put('/', zodValidator(settingsSchema), settingsController.updateSettings);

module.exports = router;
