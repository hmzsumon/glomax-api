const Deposit = require('../models/depositModel');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const AdminNotification = require('../models/adminNotification');

// get all isRead = false notifications
exports.unReadNotifications = catchAsyncErrors(async (req, res, next) => {
	const notifications = await AdminNotification.find({ isRead: false }).sort({
		createdAt: -1,
	});
	res.status(200).json({
		success: true,
		notifications,
	});
});

// update notification to isRead = true
exports.updateNotification = catchAsyncErrors(async (req, res, next) => {
	const notification = await AdminNotification.findById(req.params.id);
	if (!notification) {
		return next(new ErrorHandler('Notification not found', 404));
	}
	notification.isRead = true;
	await notification.save();
	res.status(200).json({
		success: true,
		notification,
	});
});
