const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const {
	unReadNotifications,
	updateNotification,
} = require('../controllers/userNotificationController');

// get all isRead = false notifications
router.get('/user-notifications', isAuthenticatedUser, unReadNotifications);

// update notification to isRead = true
router.put(
	'/update/notifications/:id',
	isAuthenticatedUser,
	updateNotification
);

module.exports = router;
