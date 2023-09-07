const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema(
	{
		subject: {
			type: String,
		},
		subject_id: {
			type: String,
		},
		type: {
			type: String,
		},
		message: {
			type: String,
		},
		isRead: {
			type: Boolean,
			default: false,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		username: {
			type: String,
		},
		url: {
			type: String,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
