const mongoose = require('mongoose');

const withdrawDetailsSchema = new mongoose.Schema(
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

		total_withdraw: {
			type: Number,
			default: 0,
		},
		last_withdraw_amount: {
			type: Number,
			default: 0,
		},
		last_withdraw_date: {
			type: Date,
		},
		total_cancel_withdraw: {
			type: Number,
			default: 0,
		},
		last_cancel_withdraw_amount: {
			type: Number,
			default: 0,
		},
		last_cancel_withdraw_date: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('WithdrawDetails', withdrawDetailsSchema);
