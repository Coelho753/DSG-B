const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { getAuditLogs } = require('../controllers/auditController');

const router = express.Router();

router.get('/', authMiddleware, authorizeRoles('admin'), getAuditLogs);

module.exports = router;
