const mongoose = require('mongoose');

const playDetailsSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
		customer_id: {
			type: String,
			require: true,
		},
		email: {
			type: String,
			require: true,
		},
		phone: {
			type: String,
			require: true,
		},

		total_win: {
			type: Number,
			default: 0,
		},
		total_loss: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('PlayDetails', playDetailsSchema);
