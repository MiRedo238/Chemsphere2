const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authenticateToken = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET /api/notifications - Get notifications
router.get('/', notificationController.getNotifications);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;