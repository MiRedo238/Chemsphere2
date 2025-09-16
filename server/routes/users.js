const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');
const requireRole = require('../middleware/roles');
const { validateUser } = require('../middleware/validation');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

// GET /api/users - Get all users
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// POST /api/users - Create new user
router.post('/', validateUser, userController.createUser);

// PUT /api/users/:id - Update user
router.put('/:id', validateUser, userController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;