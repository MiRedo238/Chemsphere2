const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const { validateEquipment, validateUsageLog } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// GET /api/equipment - Get all equipment
router.get('/', equipmentController.getAllEquipment);

// GET /api/equipment/:id - Get equipment by ID
router.get('/:id', equipmentController.getEquipmentById);

// POST /api/equipment - Create new equipment (admin only)
router.post('/', requireRole('admin'), validateEquipment, equipmentController.createEquipment);

// PUT /api/equipment/:id - Update equipment (admin only)
router.put('/:id', requireRole('admin'), validateEquipment, equipmentController.updateEquipment);

// DELETE /api/equipment/:id - Delete equipment (admin only)
router.delete('/:id', requireRole('admin'), equipmentController.deleteEquipment);

// POST /api/equipment/usage - Log equipment usage
router.post('/usage', validateUsageLog, equipmentController.logEquipmentUsage);

module.exports = router;