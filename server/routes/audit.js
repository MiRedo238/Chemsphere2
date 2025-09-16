const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roles');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

// GET /api/audit - Get audit logs
router.get('/', auditController.getAuditLogs);

// GET /api/audit/:id - Get audit log by ID
router.get('/:id', auditController.getAuditLogById);

module.exports = router;