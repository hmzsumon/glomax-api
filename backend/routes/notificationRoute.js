const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const {
	unReadNotifications,
	updateNotification,
} = require('../controllers/notificationController');

// get all isRead = false notifications
router.get(
	'/admin/notifications',
	isAuthenticatedUser,
	authorizeRoles('admin'),
	unReadNotifications
);

// update notification to isRead = true
router.put(
	'/admin/notification/:id',
	isAuthenticatedUser,
	authorizeRoles('admin'),
	updateNotification
);

module.exports = router;
