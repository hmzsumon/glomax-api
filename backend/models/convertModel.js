const mongoose = require('mongoose');

const convertSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
		customer_id: {
			type: String,
			required: true,
		},
		amount: {
			type: Number,
			default: 0,
		},
		from: {
			type: String,
		},
		to: {
			type: String,
		},
		status: {
			type: String,
			enum: ['pending', 'success', 'failed'],
			default: 'pending',
		},
	},
	{
		timestamps: true,
	}
);

const Convert = mongoose.model('Convert', convertSchema);

module.exports = Convert;
