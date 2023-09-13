const mongoose = require('mongoose');

const userNotificationSchema = mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		subject: {
			type: String,
		},
		description: {
			type: String,
		},
		is_read: {
			type: Boolean,
			default: false,
		},
		url: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('UserNotification', userNotificationSchema);
