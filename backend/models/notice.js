const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
	{
		description: {
			type: String,
			trim: true,
		},
		active: {
			type: Boolean,
			default: false,
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Notice', noticeSchema);
