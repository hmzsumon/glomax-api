const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const UserNotification = require('../models/userNotification');

// get all isRead = false notifications
exports.unReadNotifications = catchAsyncErrors(async (req, res, next) => {
	const id = req.user._id;
	console.log(id);
	const notifications = await UserNotification.find({
		user_id: id,
		is_read: false,
	}).sort({
		createdAt: -1,
	});

	// console.log(notifications.length);

	res.status(200).json({
		success: true,
		notifications,
	});
});

// update notification to isRead = true
exports.updateNotification = catchAsyncErrors(async (req, res, next) => {
	const notification = await UserNotification.findById(req.params.id);
	if (!notification) {
		return next(new ErrorHandler('Notification not found', 404));
	}
	notification.is_read = true;
	await notification.save();
	res.status(200).json({
		success: true,
		notification,
	});
});
