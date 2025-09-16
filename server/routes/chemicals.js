const express = require('express');
const router = express.Router();
const chemicalController = require('../controllers/chemicalController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roles');

// All routes require authentication
router.use(authenticateToken);

// GET /api/chemicals - Get all chemicals
router.get('/', chemicalController.getAllChemicals);

// GET /api/chemicals/:id - Get chemical by ID
router.get('/:id', chemicalController.getChemicalById);

// POST /api/chemicals - Create new chemical (admin only)
router.post('/', requireRole('admin'), chemicalController.createChemical);

// PUT /api/chemicals/:id - Update chemical (admin only)
router.put('/:id', requireRole('admin'), chemicalController.updateChemical);

// DELETE /api/chemicals/:id - Delete chemical (admin only)
router.delete('/:id', requireRole('admin'), chemicalController.deleteChemical);

// POST /api/chemicals/usage - Log chemical usage
router.post('/usage', chemicalController.logChemicalUsage);

module.exports = router;