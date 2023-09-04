const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
	{
		// user
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			enum: ['deposit', 'withdraw', 'transfer', 'admin', 'other'],
			required: true,
		},
		message: {
			type: String,
		},
		admin_message: {
			type: String,
		},
		is_read: {
			type: Boolean,
			default: false,
		},
		is_new: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Notification', notificationSchema);
