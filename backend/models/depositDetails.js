const mongoose = require('mongoose');

const depositDetailsSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			require: true,
		},
		email: {
			type: String,
			require: true,
		},
		customer_id: {
			type: String,
			require: true,
		},
		total_deposit: {
			type: Number,
			default: 0,
		},
		last_deposit_amount: {
			type: Number,
			default: 0,
		},

		last_deposit_date: {
			type: Date,
		},
		first_deposit_date: {
			type: Date,
		},
		first_deposit_amount: {
			type: Number,
			default: 0,
		},
		is_new: {
			type: Boolean,
			default: false,
		},
		// first deposit bonus
		first_deposit_bonus: {
			type: Number,
			default: 0,
		},
		rejected_amount: {
			type: Number,
			default: 0,
		},
		rejected_count: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('DepositDetails', depositDetailsSchema);
